/**
 * Engine-level types — SPEC.md §5.2, §7.
 *
 * The engine is pure TypeScript with no React imports, so the matrix can be
 * validated by tests independently of the UI.
 */
import type {
  AttributeId,
  AttributeValue,
  IPhoneModel,
  Question,
  Tier,
} from '../data/types.ts'

/**
 * One thing the technician did, in the order they did it.
 *
 * Answers and skips share a shape because they share a job: both take a
 * question out of circulation, and only one of them narrows the candidate set.
 * Keeping them in one ordered list is what makes _Back_ and the answer trail
 * (§4.1, §4.5) plain reads of the state rather than bookkeeping.
 */
export interface Step {
  attribute: AttributeId
  /** `null` is "Can't tell / not visible" (§4.2) — it eliminates nothing. */
  value: AttributeValue | null
  /** The tier the flow was in when this step was taken. */
  tier: Tier
}

/** The state of one identification run. Treated as immutable throughout. */
export interface IdentifyState {
  steps: Step[]
  /** Coarse by default; deep only after an explicit "Narrow further" (D-03). */
  tier: Tier
}

/** A question scored against the current candidate set (§7 step 2). */
export interface ScoredQuestion {
  attribute: AttributeId
  /**
   * Expected reduction in candidate count, treating remaining models as equally
   * likely. Higher is better; 0 means the question cannot split this set.
   */
  gain: number
  /** Expected size of the candidate set after this question is answered. */
  expectedRemaining: number
}

/** Where the flow currently stands — drives which screen the UI shows (§4). */
export type IdentifyStatus =
  /** A question is waiting to be answered. */
  | 'asking'
  /** Coarse tier exhausted with more than one candidate — offer "Narrow further" (§4.3). */
  | 'narrow-further'
  /** Exactly one candidate: the result screen (§4.5). */
  | 'resolved'
  /** More than one candidate and nothing left to ask — terminal ambiguity (§4.4). */
  | 'ambiguous'
  /** No candidate is consistent with the answers given. */
  | 'contradictory'

/** A full read of the flow: everything a screen needs, derived from the state. */
export interface IdentifyResult {
  status: IdentifyStatus
  /** Models still consistent with the answers, in matrix order. */
  candidates: IPhoneModel[]
  /** The question to ask, when `status` is 'asking'. */
  question?: Question
  /**
   * Attributes the technician answered "Can't tell" on that would still split
   * the remaining candidates. §4.2 requires the result screen to name these and
   * offer to revisit them.
   */
  revisitable: AttributeId[]
}
