/**
 * Candidate filtering — the matching rule from SPEC.md §5.4.
 *
 * > An answer `v` to attribute `a` eliminates model `M` if and only if
 * > `M.attributes[a]` is present and non-empty and does not contain `v`.
 *
 * The "if and only if" is the whole safety property. Missing data never
 * eliminates, so an incomplete matrix degrades to a larger candidate group
 * rather than to a wrong answer — which is why the transcription drops
 * unverified values instead of guessing them (D-11).
 */
import type {
  AttributeId,
  AttributeValue,
  IPhoneModel,
  Question,
} from '../data/types.ts'
import type { Step } from './types.ts'

/**
 * Whether `model` is still consistent with answering `value` to `attribute`.
 *
 * Returns true when the model records no value for the attribute: unknown is
 * not the same as contradicted.
 */
export function isConsistent(
  model: IPhoneModel,
  attribute: AttributeId,
  value: AttributeValue,
): boolean {
  const known = model.attributes[attribute]
  if (known === undefined || known.length === 0) return true
  return known.includes(value)
}

/**
 * Narrows `models` by one step.
 *
 * A step with a `null` value is "Can't tell" (§4.2) and eliminates nothing.
 *
 * `question` is optional and only consulted for its `eliminating` flag (§6.4):
 * a question marked non-eliminating records the answer without removing
 * anything, which is the one-line revert if colour turns out to fail unsafely
 * in practice. Pass nothing and the answer eliminates.
 */
export function applyStep(
  models: IPhoneModel[],
  step: Step,
  question?: Question,
): IPhoneModel[] {
  const { attribute, value } = step
  if (value === null) return models
  if (question && !question.eliminating) return models
  return models.filter((model) => isConsistent(model, attribute, value))
}

/** The candidate set implied by a run of steps. */
export function candidatesFor(
  models: IPhoneModel[],
  steps: Step[],
  questions: Question[] = [],
): IPhoneModel[] {
  const byId = new Map(questions.map((question) => [question.id, question]))
  return steps.reduce(
    (remaining, step) => applyStep(remaining, step, byId.get(step.attribute)),
    models,
  )
}

/**
 * The values of `attribute` that at least one candidate can take, in the order
 * the question declares them. Used to hide options that cannot apply to
 * anything still in the running.
 *
 * Candidates with no recorded value contribute nothing here but are still
 * consistent with every answer, per the matching rule.
 */
export function liveValues(
  models: IPhoneModel[],
  attribute: AttributeId,
): Set<AttributeValue> {
  const values = new Set<AttributeValue>()
  for (const model of models) {
    for (const value of model.attributes[attribute] ?? []) values.add(value)
  }
  return values
}
