/**
 * The registry has to agree with the question set in both directions — SPEC.md §8.
 *
 * These are the two ways Phase 4 can rot. A diagram id in `questions.ts` with no
 * component renders a blank space where a picture should be, and the screen has
 * no way to know it was meant to have one. A component nobody references is
 * dead weight that still looks maintained. Neither shows up in a type error, so
 * they are asserted here.
 */
import { describe, expect, it } from 'vitest'
import { questions } from '../data/questions.ts'
import { diagrams } from './registry.ts'

const declared = questions.flatMap((question) =>
  question.options
    .map((option) => option.diagram)
    .filter((id): id is string => id !== undefined),
)

describe('the diagram registry', () => {
  it('draws every diagram the question set asks for', () => {
    const missing = declared.filter((id) => !(id in diagrams))
    expect(missing).toEqual([])
  })

  it('holds nothing the question set does not ask for', () => {
    const orphans = Object.keys(diagrams).filter((id) => !declared.includes(id))
    expect(orphans).toEqual([])
  })

  it('covers all 33 declared ids', () => {
    expect(declared).toHaveLength(33)
    expect(Object.keys(diagrams)).toHaveLength(33)
  })
})
