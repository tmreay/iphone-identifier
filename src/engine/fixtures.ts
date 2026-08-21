/**
 * Small hand-built fixtures for the engine tests.
 *
 * The engine tests use these rather than the real matrix on purpose: they are
 * about the algorithm, and a fixture makes the expected arithmetic obvious.
 * The real matrix is exercised by `reachability.test.ts`.
 */
import type { AttributeValue, IPhoneModel, Question } from '../data/types.ts'

export function model(
  id: string,
  attributes: Record<string, AttributeValue[]>,
): IPhoneModel {
  return {
    id,
    name: id,
    released: 2020,
    attributes,
    colours: (attributes.colour ?? []).map((value) => ({ value, marketing: value })),
  }
}

export function question(
  id: string,
  values: AttributeValue[],
  overrides: Partial<Question> = {},
): Question {
  return {
    id,
    tier: 'coarse',
    prompt: id,
    options: values.map((value) => ({ value, label: value })),
    priority: 50,
    eliminating: true,
    ...overrides,
  }
}
