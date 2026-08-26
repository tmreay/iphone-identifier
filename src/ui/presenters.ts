/**
 * Display text derived from engine state — SPEC.md §4.1, §4.2, §4.4, §4.5.
 *
 * Everything here is a pure function of data the engine already produces. It
 * lives apart from the components for one reason: the wording is where this
 * phase can be wrong in a way a technician notices. A screen that says "these
 * two differ only by rear wordmark" when a third thing also separates them is a
 * lie the engine cannot catch, so the sentences are built here and tested
 * directly, under the `node` test environment the project already runs.
 *
 * Nothing here imports React.
 */
import type {
  AttributeId,
  IPhoneModel,
  ModelId,
  Question,
  QuestionOption,
} from '../data/types.ts'
import { liveValues } from '../engine/index.ts'
import type { IdentifyStatus, Step } from '../engine/types.ts'

/**
 * Words that are not words: attribute ids are snake_case, and three of them
 * carry names that lose their meaning in lower case.
 *
 * Applied per word rather than per attribute id so a later attribute naming the
 * same thing — `sim_tray_side`, say — reads correctly without another entry.
 */
const PROPER_WORDS: Record<string, string> = {
  sim: 'SIM',
  magsafe: 'MagSafe',
  lidar: 'LiDAR',
}

/**
 * An attribute's name as it appears mid-sentence, e.g. `rear_wordmark` →
 * "rear wordmark".
 *
 * Derived from the id rather than read off the question, because a `Question`
 * carries a prompt ("Which rear camera arrangement matches the phone?") and no
 * noun phrase to drop into a sentence. The ids are already written as English
 * with underscores for spaces, so this is a rendering of what is there, not an
 * invention — and it keeps §5.4's `Question` shape untouched.
 */
export function attributeLabel(attribute: AttributeId): string {
  return attribute
    .split('_')
    .map((word) => PROPER_WORDS[word] ?? word)
    .join(' ')
}

/** One line of the answer trail (§4.1). */
export interface TrailEntry {
  attribute: AttributeId
  /** The question as it was asked. */
  prompt: string
  /** The option label chosen, or `null` for "Can't tell" (§4.2). */
  answer: string | null
  /** Short noun phrase for the attribute, for compact readings of the trail. */
  label: string
}

/**
 * The answer trail: what was asked, and what the technician said, in order.
 *
 * Skips are in the trail rather than filtered out of it. They are a decision the
 * technician made and may want to revisit (§4.2), and a trail that silently
 * omitted them would make the candidate count look unexplained.
 */
export function trailEntries(questions: Question[], steps: Step[]): TrailEntry[] {
  const byId = new Map(questions.map((question) => [question.id, question]))
  return steps.map((step) => {
    const question = byId.get(step.attribute)
    const option = question?.options.find((candidate) => candidate.value === step.value)
    return {
      attribute: step.attribute,
      prompt: question?.prompt ?? attributeLabel(step.attribute),
      answer: step.value === null ? null : (option?.label ?? step.value),
      label: attributeLabel(step.attribute),
    }
  })
}

/** Joins a list into English: "a", "a and b", "a, b and c". */
export function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * The §4.2 sentence naming the skipped attributes still standing between the
 * candidates — the spec's "these two differ only by rear logo position, which
 * you skipped".
 *
 * The word **only** is the load-bearing one, and it is not always true. On the
 * `ambiguous` screen nothing but these skips can split the set, so "only" is
 * earned. At the `narrow-further` step the deep tier can also split it, so the
 * sentence drops "only" rather than overstating what revisiting will settle.
 *
 * Returns `null` when there is nothing to offer, which is also what the engine
 * reports whenever the run has already resolved to one model.
 */
export function revisitPrompt(
  candidates: IPhoneModel[],
  revisitable: AttributeId[],
  status: IdentifyStatus,
): string | null {
  if (revisitable.length === 0) return null
  const names = listPhrase(revisitable.map(attributeLabel))
  const these = candidates.length === 2 ? 'These two' : `These ${candidates.length}`
  return status === 'ambiguous'
    ? `${these} differ only by ${names}, which you skipped.`
    : `${these} can still be told apart by ${names}, which you skipped.`
}

/**
 * The plain statement §4.4 demands when the matrix cannot separate what is
 * left: name the models, say so outright, and do not dress it up as a question
 * the technician failed to answer.
 *
 * **Only when the group is genuinely terminal.** `ambiguous` means nothing is
 * left to _ask_, which is not the same as nothing being left to _know_: a run
 * that skipped colour reaches the same status with colour still able to split
 * the group. Stating "nothing distinguishes them" there is false, and false in
 * a way the technician can see, because the §4.2 offer to revisit that very
 * attribute sits directly underneath it. So this returns `null` whenever there
 * is a skip worth revisiting, and `revisitPrompt` does the talking instead.
 *
 * The 16/17 pair is exactly this case: terminal on the answers most runs give,
 * but separable on the finishes the two do not share (§9).
 */
export function ambiguityStatement(
  candidates: IPhoneModel[],
  revisitable: AttributeId[],
): string | null {
  if (revisitable.length > 0) return null
  const names = candidates.map((model) => model.name)
  const list = names.length === 2 ? names.join(' or ') : listPhrase(names)
  return `${list} — no characteristic recorded here distinguishes them.`
}

/**
 * The non-visual tiebreaker, offered "always as a hint, never as a required
 * step" (§4.4). Phrased for a phone that may well be dead on the bench.
 */
export const powerOnHint =
  'If the phone powers on, Settings → General → About → Model Name settles it. Only if it powers on — this is a hint, not a step.'

/**
 * "12 of 37 models match" — the live count §4.1 step 3 asks for.
 *
 * The strip below shows the same count as lit chips, which is the reading a
 * technician glancing at the bench wants. This sentence is what that picture
 * cannot say out loud: it stays as the strip's accessible summary, announced on
 * each change, so the count is never something only sighted use has.
 */
export function candidateCount(remaining: number, total: number): string {
  if (remaining === 1) return `1 of ${total} models matches`
  return `${remaining} of ${total} models match`
}

/**
 * What the photographs are doing on a group the matrix cannot split (§4.4, §9).
 *
 * §12 raised this against showing model pictures at all, and the objection is
 * sound where it applies: the groups that survive to the end are the pairs §9
 * records as identical on every attribute here, so their product shots are
 * identical too. Showing them anyway is still right — they confirm the *kind*
 * of phone on the bench, which is the check a technician makes before ordering
 * a part — but the screen has to say which of those two jobs the picture can
 * do, or it reads as an invitation to squint until one looks righter.
 */
export const identicalPhotoNote =
  'The photographs confirm the shape in your hand; they cannot choose between these. Nothing visible separates them, in the pictures or on the bench.'

/**
 * "12 of 37 candidates" — the collapsed candidate strip's own label.
 *
 * Shorter than `candidateCount` and phrased as a thing rather than a claim,
 * because it sits on a button: what a technician taps is the count, and what
 * opens is the list behind it. The sentence form stays where it belongs, in the
 * live region, where "12 of 37 models match" reads as English rather than as a
 * label read out of a control.
 */
export function candidateSummary(remaining: number, total: number): string {
  return `${remaining} of ${total} candidates`
}

/**
 * The options worth showing for `question` against the current candidates.
 *
 * Hides values nothing still in the running can take, so the technician is
 * never offered an answer that would empty the candidate set (`liveValues`
 * exists for exactly this). A candidate that records no value for the attribute
 * survives every answer under §5.4 and contributes nothing here — which is why
 * the empty case falls back to the full list rather than to no options at all.
 * The selector scores a question no candidate records at zero gain and never
 * asks it, so that fallback is a floor under a state that should not arise.
 */
export function visibleOptions(
  question: Question,
  candidates: IPhoneModel[],
): QuestionOption[] {
  const live = liveValues(candidates, question.id)
  if (live.size === 0) return question.options
  return question.options.filter((option) => live.has(option.value))
}

/**
 * One model's place in the candidate strip.
 *
 * The strip is §4.1 step 3's live count made legible — the row of model names
 * §12 asks for, dimming each as it is eliminated. Names only: the pictures half
 * of that open question costs something quite different, and §12 defers it.
 */
export interface StripEntry {
  id: ModelId
  /** The full name, for the chip's title and the accessible reading. */
  name: string
  /** The name as the chip shows it, e.g. `iPhone 13 Pro Max` → "13 Pro Max". */
  short: string
  /** False once an answer has ruled this model out. */
  remaining: boolean
}

/**
 * A model name at chip width.
 *
 * Every name in the matrix opens with "iPhone", so across a strip of all 37 the
 * word carries no information while costing the width that tells "13 Pro" from
 * "13 Pro Max". Dropping "generation" from the two SE names is the same trade.
 * Neither is the only place a model is named in full — the chip keeps the whole
 * name in its `title`, and the summary sentence spells the survivors out.
 */
export function shortModelName(name: string): string {
  return name.replace(/^iPhone /, '').replace(/ generation\)$/, ')')
}

/**
 * The strip: every model in the matrix, flagged for whether it is still in the
 * running.
 *
 * In matrix order, which is release order, because that is what makes the
 * dimming readable: answers eliminate by era and by generation, so whole runs
 * of the strip go out together rather than a scatter of chips across it.
 */
export function candidateStrip(
  all: IPhoneModel[],
  candidates: IPhoneModel[],
): StripEntry[] {
  const remaining = new Set(candidates.map((model) => model.id))
  return all.map((model) => ({
    id: model.id,
    name: model.name,
    short: shortModelName(model.name),
    remaining: remaining.has(model.id),
  }))
}
