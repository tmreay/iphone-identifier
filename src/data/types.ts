/**
 * Core data model — SPEC.md §5.4.
 *
 * These types are shared by the matrix, the question set and the engine. They
 * are deliberately structural rather than a closed union of literals: the
 * allowed values for each attribute are declared as data in `attributes.ts` and
 * checked by tests, so adding a value is a data change, not a type change (D-02).
 */

/** e.g. `'iphone-13-pro-max'` */
export type ModelId = string
/** e.g. `'rear_camera_layout'` */
export type AttributeId = string
/** e.g. `'dual_diagonal'` */
export type AttributeValue = string

/** Coarse questions are asked in the main flow; deep ones behind "Narrow further" (D-03). */
export type Tier = 'coarse' | 'deep'

export interface ColourOption {
  /** Palette value the engine matches on, and the question option value. */
  value: AttributeValue
  /** Apple's marketing name for this model in this colour. Display only. */
  marketing: string
}

export interface IPhoneModel {
  id: ModelId
  name: string
  /** Year of release. */
  released: number
  /**
   * For each attribute, the set of values consistent with this model.
   * Multiple values are legitimate: a model has many colours, and may ship in
   * both SIM-tray and eSIM-only bodies. Size is no longer among them — D-31
   * gives every model exactly one `body_size_class`.
   * An absent or empty entry means "unknown" and eliminates nothing.
   */
  attributes: Partial<Record<AttributeId, AttributeValue[]>>
  /**
   * Colours this model shipped in, carrying both naming layers (§6.5).
   * The set of `value`s must equal attributes.colour — asserted by test.
   */
  colours: ColourOption[]
}

export interface QuestionOption {
  value: AttributeValue
  label: string
  /** Diagram component id (Phase 4). */
  diagram?: string
  /** Shown inline under the label, e.g. the fine-call warning on camera bump size. */
  caveat?: string
}

export interface Question {
  id: AttributeId
  tier: Tier
  prompt: string
  help?: string
  options: QuestionOption[]
  /** Higher = prefer asking earlier when information gain is close. */
  priority: number
  /** If false, an answer ranks candidates but never eliminates them. */
  eliminating: boolean
}

/** One attribute's schema: which tier it belongs to and its permitted values. */
export interface AttributeDefinition {
  id: AttributeId
  tier: Tier
  values: AttributeValue[]
}
