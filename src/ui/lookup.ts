/**
 * Reverse lookup — SPEC.md §4.6.
 *
 * Turns a model into the rows its entry displays. Pure, React-free, and tested
 * against the real matrix, for the same reason `presenters.ts` is: this is the
 * screen a technician holds a phone against to confirm a result, so a row that
 * reads plausibly and says the wrong thing is worse here than anywhere else in
 * the app.
 *
 * Two shaping decisions live here rather than in the components.
 *
 * **Row order is `attributes.ts` order**, which is §6.1 then §6.2, which is the
 * order the tables in `reference/models/<id>.md` are written in. §4.6 names
 * reviewing and correcting the underlying data as one of this view's jobs, and
 * that job is reading the entry beside the reference file — so the two read in
 * the same sequence and a discrepancy shows up level with itself.
 *
 * **An attribute the matrix does not record gets a row saying so**, rather than
 * being left out. 65 of the 666 rows are absent by design: `reference/` flags
 * them 🔴 unverified or ⚪ not applicable and the transcription drops both
 * rather than guessing (D-14). Nothing downstream can tell those two apart —
 * the matrix records absence, not a reason — so the entry states the one thing
 * true of both: under §5.4 an absent value eliminates nothing.
 */
import { attributes } from '../data/attributes.ts'
import type {
  AttributeId,
  AttributeValue,
  IPhoneModel,
  ModelId,
  Question,
  Tier,
} from '../data/types.ts'
import { attributeLabel, listPhrase } from './presenters.ts'

/** One value an attribute takes on this model, worded as the question words it. */
export interface EntryValue {
  value: AttributeValue
  /**
   * The option label from `questions.ts`.
   *
   * Not a rendering of the value id. The entry exists to be checked against a
   * phone on the bench, and "Two lenses set diagonally in a large rounded
   * square" is what that check needs — the same sentence the flow would have
   * put in front of the technician, so confirming a result never means
   * translating between two descriptions of one thing.
   */
  label: string
  diagram?: string
}

export interface EntryRow {
  attribute: AttributeId
  label: string
  tier: Tier
  /**
   * Every value the matrix records, or empty where it records none.
   *
   * More than one is ordinary rather than exceptional: a model has many colours
   * and may ship in both SIM-tray and eSIM-only bodies (§5.4). Size is not one
   * of them — every model has exactly one `body_size_class` (D-31).
   */
  values: EntryValue[]
}

/**
 * Colour is excluded from the attribute rows and given its own section.
 *
 * It is the one attribute carrying two naming layers (§6.5), and the entry is
 * where both are listed in full — the generic row shape has nowhere to put a
 * marketing name. Dropping it here loses nothing, because `colourRows` covers
 * the same values: `models.test.ts` pins `colours` and `attributes.colour` to
 * the same set, and a test below pins the two halves to covering every
 * attribute between them.
 */
const COLOUR: AttributeId = 'colour'

/**
 * The sentence an absent row carries.
 *
 * Phrased as a consequence rather than an apology. "Not recorded" alone reads
 * as a hole in the app; what a technician needs to know is that the hole is
 * harmless — an attribute the matrix does not record never rules this model
 * out, which is exactly why it is safe for the matrix to have one.
 */
export const notRecordedNote =
  'Not recorded. An attribute the matrix leaves blank never rules a model out, so a blank row costs a wider group and never a wrong answer.'

/**
 * An attribute's name as a row heading rather than mid-sentence.
 *
 * `attributeLabel` is built for prose — "These two differ only by rear
 * wordmark" (§4.2) — so it stays lower case. A row label in this view is a
 * heading standing on its own, and lower case reads as a mistake beside the
 * three names that carry their own capitals. Only the first character moves:
 * upper-casing the whole thing would turn SIM, MagSafe and LiDAR into shouting,
 * and title case would invent capitals the rest of the app does not use.
 */
export function rowLabel(attribute: AttributeId): string {
  const label = attributeLabel(attribute)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Rows for every attribute except colour, in §6.1 then §6.2 order. */
export function entryRows(model: IPhoneModel, questions: Question[]): EntryRow[] {
  const byId = new Map(questions.map((question) => [question.id, question]))

  return attributes
    .filter((attribute) => attribute.id !== COLOUR)
    .map((attribute) => {
      const options = byId.get(attribute.id)?.options ?? []
      const recorded = model.attributes[attribute.id] ?? []
      return {
        attribute: attribute.id,
        label: rowLabel(attribute.id),
        tier: attribute.tier,
        values: recorded.map((value) => {
          const option = options.find((candidate) => candidate.value === value)
          return {
            value,
            // `questions.test.ts` asserts every value the matrix uses is
            // offered, so the fallback is a floor under a state that fails CI
            // rather than a case that reaches a technician.
            label: option?.label ?? value,
            diagram: option?.diagram,
          }
        }),
      }
    })
}

/** One palette value this model shipped in, with every marketing name under it. */
export interface ColourRow {
  value: AttributeValue
  /** The colour question's option label, e.g. "White or silver". */
  label: string
  /** Apple's names for this shade on this model — display only, never matched (D-12). */
  marketing: string[]
}

/**
 * The colours this model shipped in, grouped by palette value.
 *
 * Grouped because the two layers are not one-to-one in either direction, and
 * both directions are in the data:
 *
 * - **Two names, one value.** The iPhone 15 Pro records Natural Titanium and
 *   White Titanium as `white_silver`, which is the coarse palette doing its job
 *   (§6.5) — a technician cannot tell those apart under shop lighting.
 * - **One name, two values.** The iPhone 13's "Blue" is recorded as both
 *   `light_blue` and `dark_blue`. `reference/models/iphone-13.md` calls it a
 *   boundary shade and says why: carrying both values means neither answer can
 *   eliminate the model, which is the safe way to record a shade that sits
 *   between two palette entries.
 *
 * The second reads as a duplicate on the screen, so `boundaryShades` names it.
 */
export function colourRows(model: IPhoneModel, questions: Question[]): ColourRow[] {
  const options = questions.find((question) => question.id === COLOUR)?.options ?? []
  const grouped = new Map<AttributeValue, string[]>()

  for (const colour of model.colours) {
    const names = grouped.get(colour.value)
    if (names) names.push(colour.marketing)
    else grouped.set(colour.value, [colour.marketing])
  }

  // Palette order, not the order the reference file happens to list them in, so
  // every entry in the set reads down its colours the same way.
  return options
    .filter((option) => grouped.has(option.value))
    .map((option) => ({
      value: option.value,
      label: option.label,
      marketing: grouped.get(option.value) ?? [],
    }))
}

/**
 * Marketing names this model records under more than one palette value.
 *
 * The screen shows these to explain a shade that would otherwise look listed
 * twice by mistake. Empty for all but the iPhone 13 and 13 mini today; derived
 * rather than hard-coded, so a boundary shade added to `reference/` later
 * explains itself without anyone remembering to come back here.
 */
export function boundaryShades(model: IPhoneModel): string[] {
  const values = new Map<string, Set<AttributeValue>>()
  for (const colour of model.colours) {
    const seen = values.get(colour.marketing) ?? new Set()
    seen.add(colour.value)
    values.set(colour.marketing, seen)
  }
  return [...values].filter(([, seen]) => seen.size > 1).map(([marketing]) => marketing)
}

/**
 * The sentence explaining a shade listed under two palette values, or `null`.
 *
 * Without it the entry looks like it has a bug — "Light blue — Blue" directly
 * above "Dark blue — Blue" reads as the same colour typed twice. It is neither:
 * it is a shade the palette deliberately refuses to call, and saying so turns
 * an apparent data error into the reassurance it actually is.
 */
export function boundaryShadeNote(model: IPhoneModel): string | null {
  const names = boundaryShades(model)
  if (names.length === 0) return null
  const quoted = listPhrase(names.map((name) => `“${name}”`))
  const [subject, verb] = names.length === 1 ? ['it', 'sits'] : ['they', 'sit']
  return `${quoted} ${names.length === 1 ? 'is a boundary shade' : 'are boundary shades'}: ${subject} ${verb} between two entries in the palette, so ${subject} ${names.length === 1 ? 'is' : 'are'} recorded under both and neither answer rules this model out.`
}

export interface ModelGroup {
  year: number
  models: IPhoneModel[]
}

/**
 * The browsable list, grouped by release year (§3.1, §4.6).
 *
 * Preserves the order `models.ts` is generated in — chronological, then by name
 * — rather than sorting again. That order is a build output checked byte for
 * byte by `transcribe:check`, so relying on it keeps one definition of "the
 * order the models come in" instead of a second one that could drift from it.
 */
export function modelsByYear(models: IPhoneModel[]): ModelGroup[] {
  const groups: ModelGroup[] = []
  for (const model of models) {
    const last = groups[groups.length - 1]
    if (last && last.year === model.released) last.models.push(model)
    else groups.push({ year: model.released, models: [model] })
  }
  return groups
}

/** The model with this id, or `undefined` — a hash can name anything (§5.2). */
export function modelById(models: IPhoneModel[], id: ModelId): IPhoneModel | undefined {
  return models.find((model) => model.id === id)
}
