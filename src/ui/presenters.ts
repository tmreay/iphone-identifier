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
import type {
  IdentifyResult,
  IdentifyState,
  IdentifyStatus,
  Step,
} from '../engine/types.ts'
import type { ModelOrigin, Route } from './route.ts'

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
 * The strip shows the same count — as its own collapsed label, and as lit chips
 * once opened. This sentence is what those cannot say out loud: it is spoken
 * from the live region in `App.tsx`, announced on each change, so the narrowing
 * is never something only sighted use has.
 */
export function candidateCount(remaining: number, total: number): string {
  if (remaining === 1) return `1 of ${total} models matches`
  return `${remaining} of ${total} models match`
}

/**
 * The way out of a model entry, worded for where the entry was opened from.
 *
 * Deliberately vague about what is waiting on the other side. An entry reached
 * from a run may return to a question, to a group, or to a result — all three
 * hand out `from: 'identify'` — and after a reload it returns to a fresh run,
 * because the hash survives a reload and the answer trail does not (D-25). The
 * hash is honest about *where* the button goes and cannot promise *what will be
 * there*, so the label promises only the former.
 */
export function entryBackLabel(from: ModelOrigin): string {
  return from === 'identify' ? 'Back to identifying' : 'All models'
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
 * §12 asks for, dimming each as it is eliminated. Names only, still: D-30 put
 * the photographs where the app has stopped asking, and the strip is the one
 * surface that is live while it is still asking.
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

/**
 * Where a crumb goes when it is tapped — SPEC.md §4.7.
 *
 * Three destinations, because the app has three places to be and one of them is
 * a state rather than a view: *restart* is the root crumb, which throws the run
 * away and starts a fresh identification, and is the only crumb that touches the
 * run at all. The last crumb is where we already are and carries no target.
 */
export type CrumbTarget = 'restart' | 'identify' | 'models'

/** One step of the breadcrumb (§4.7). */
export interface Crumb {
  /** Stable across renders of the same trail, for React's list keys. */
  key: string
  label: string
  /** Absent on a crumb that is not a destination: the current one, or a marker. */
  target?: CrumbTarget
}

/**
 * The root, and the only crumb on every trail: a fresh run, always one tap away.
 *
 * The only crumb that touches the run, so it is also the only one that can cost
 * the technician work — which is why it is not always a restart. It offers to
 * throw a run away only when there is a run to throw; with nothing answered yet
 * it is the plain way back to the flow, and on the flow itself it is where you
 * already are. That is the same guard _Start over_ carries (§4.1), and it
 * matters more here: a crumb sits where a reader expects inert navigation, at a
 * quarter of that button's size.
 */
const rootCrumb = (target?: CrumbTarget): Crumb => ({
  key: 'root',
  label: 'New identification',
  target,
})

/**
 * Whether this run has anything in it worth keeping.
 *
 * Deliberately the same test _Start over_ is disabled by: entering the deep tier
 * counts even with nothing answered, because agreeing to _Narrow further_ is a
 * decision the technician made and starting over discards it.
 */
const started = (state: IdentifyState): boolean =>
  state.steps.length > 0 || state.tier === 'deep'

/** First letter up, for a label dropped after "Question 3: ". */
const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

/**
 * What the run is doing right now, in one crumb.
 *
 * Read off the engine's own status rather than tracked separately, so the
 * breadcrumb cannot drift from the screen underneath it. The counts are the
 * same number the strip and the live region carry; naming the question's
 * attribute is what makes the crumb say *where* rather than merely *how far*.
 */
export function flowStageLabel(state: IdentifyState, result: IdentifyResult): string {
  const step = state.steps.length + 1
  switch (result.status) {
    case 'asking':
      return result.question
        ? `Question ${step}: ${capitalise(attributeLabel(result.question.id))}`
        : `Question ${step}`
    case 'narrow-further':
      return `${result.candidates.length} candidates left`
    case 'ambiguous':
      return `${result.candidates.length} candidates — ambiguous`
    case 'resolved':
      // The name, not "Result": the crumb for a finished run is the answer it
      // finished on, which is also what the screen under it says (§4.5).
      return result.candidates[0]?.name ?? 'Result'
    case 'contradictory':
      return 'No match'
  }
}

/**
 * The run's own crumbs: the tier it is in, if it has been deepened, then where
 * it stands.
 *
 * _Narrow further_ earns a crumb of its own because it is the one step in the
 * flow the technician chose rather than was asked (§4.3, D-03) — the deep tier
 * is a place you agreed to go, so the trail should show you are in it. It is
 * never a link: it names a tier, and the flow has no way to re-enter a tier it
 * is already in. Only the stage crumb is a destination, and only from a view
 * that is not already the flow.
 */
function flowCrumbs(
  state: IdentifyState,
  result: IdentifyResult,
  showing: boolean,
): Crumb[] {
  const stage: Crumb = {
    key: 'stage',
    label: flowStageLabel(state, result),
    target: showing ? undefined : 'identify',
  }
  return state.tier === 'deep'
    ? [{ key: 'tier', label: 'Narrow further' }, stage]
    : [stage]
}

/**
 * The breadcrumb — SPEC.md §4.7.
 *
 * Rooted always at a fresh identification, because that is the one thing this
 * app is for: whatever a technician is looking at, the next phone on the bench
 * is one tap away, and the root says so.
 *
 * **A run that is still standing stays in the trail, whatever view is showing.**
 * Navigating never touched it (D-25), so the list and the entries reached from
 * it hang off the run rather than replacing it — and the crumb for it is the way
 * back that costs nothing. A trail that dropped it would leave the root as the
 * only step above you, and the root throws the run away.
 *
 * **A stage is named only when there provably is one.** `entryBackLabel` already
 * refuses to promise what is on the other side of the way out, for the reason
 * that decides it here: the hash survives a reload and the answer trail does not
 * (D-25), so an entry opened `from: 'identify'` may be sitting above a run that
 * no longer exists. A fresh run has no stage to name, so the trail names none,
 * and says the true thing — a fresh identification is what is above you.
 *
 * `opened` is the model the route names, or `undefined` when the matrix does not
 * have it — a stale bookmark, a typo. The app lands that on the list, so the
 * trail says the list too, rather than inventing a crumb for a model that is not
 * there.
 */
export function breadcrumbTrail(
  route: Route,
  state: IdentifyState,
  result: IdentifyResult,
  opened?: IPhoneModel,
): Crumb[] {
  // On the flow itself the stage is always worth naming — a fresh run is asking
  // question 1 — and the root is where you already are when there is nothing to
  // discard.
  if (route.view === 'identify') {
    return [
      rootCrumb(started(state) ? 'restart' : undefined),
      ...flowCrumbs(state, result, true),
    ]
  }

  const root = rootCrumb(started(state) ? 'restart' : 'identify')
  const run = started(state) ? flowCrumbs(state, result, false) : []

  if (route.view === 'model' && opened) {
    if (route.from === 'identify') {
      /*
        The §4.5 link opens the entry for the model the run just resolved to, and
        naming it twice in one trail reads as a fault rather than as a path. The
        stage crumb is the one that goes, because the entry crumb is where we
        are; the way back to the run is the entry's own button, which says so in
        words.
      */
      const isResult =
        result.status === 'resolved' && result.candidates[0]?.id === opened.id
      const above = isResult ? run.slice(0, -1) : run
      return [root, ...above, { key: `model-${opened.id}`, label: opened.name }]
    }
    return [
      root,
      ...run,
      { key: 'models', label: 'All models', target: 'models' },
      { key: `model-${opened.id}`, label: opened.name },
    ]
  }

  return [root, ...run, { key: 'models', label: 'All models' }]
}
