/**
 * Question-set integrity — SPEC.md §5.4, §6, §7.
 *
 * The question set is the only hand-written link between the schema and the
 * screen. If an option value drifts from `attributes.ts` the engine silently
 * stops matching on it, and the app answers confidently and wrongly — so it is
 * checked mechanically rather than by eye.
 */
import { describe, expect, it } from 'vitest'
import { attributeById, attributes } from './attributes.ts'
import { questions, questionById } from './questions.ts'
import { models } from './models.ts'

describe('the question set', () => {
  it('asks about every attribute exactly once', () => {
    expect(questions.map((question) => question.id).sort()).toEqual(
      attributes.map((attribute) => attribute.id).sort(),
    )
  })

  it('puts each question in its attribute’s tier', () => {
    for (const question of questions) {
      expect(question.tier, question.id).toBe(attributeById(question.id)?.tier)
    }
  })

  it('offers every declared value, and only declared values', () => {
    for (const question of questions) {
      const declared = attributeById(question.id)?.values ?? []
      const offered = question.options.map((option) => option.value)
      expect(new Set(offered).size, `${question.id} repeats an option`).toBe(
        offered.length,
      )
      expect([...offered].sort(), question.id).toEqual([...declared].sort())
    }
  })

  it('has no empty prompts, labels or help text', () => {
    for (const question of questions) {
      expect(question.prompt.trim(), question.id).not.toBe('')
      expect(question.help?.trim() ?? 'n/a', question.id).not.toBe('')
      for (const option of question.options) {
        expect(option.label.trim(), `${question.id}.${option.value}`).not.toBe('')
      }
    }
  })

  it("carries no Can't tell option — that is a UI affordance, not a value (§4.2)", () => {
    for (const question of questions) {
      for (const option of question.options) {
        expect(option.value, question.id).not.toMatch(
          /cant_tell|can_t_tell|unknown|skip/,
        )
      }
    }
  })

  it('gives every question a distinct priority, so ranking is deterministic (§7)', () => {
    const priorities = questions.map((question) => question.priority)
    expect(new Set(priorities).size).toBe(priorities.length)
  })

  it('draws diagrams all-or-nothing within a question (§8)', () => {
    for (const question of questions) {
      const drawn = question.options.filter((option) => option.diagram).length
      expect(
        [0, question.options.length],
        `${question.id} draws ${drawn} of its options`,
      ).toContain(drawn)
    }
  })

  it('gives every diagram a unique id', () => {
    const diagrams = questions.flatMap((question) =>
      question.options.map((option) => option.diagram).filter((id) => id !== undefined),
    )
    expect(new Set(diagrams).size).toBe(diagrams.length)
  })

  it('treats colour as eliminating, per D-08', () => {
    // §6.4 makes this the one-line revert if rehoused phones start producing
    // wrong answers in the shop. The test exists so flipping it is deliberate.
    expect(questionById('colour')?.eliminating).toBe(true)
  })

  it('warns about rehousing on the colour question (§6.4)', () => {
    const colour = questionById('colour')
    const text = `${colour?.prompt ?? ''} ${colour?.help ?? ''}`.toLowerCase()
    expect(text).toContain('original back glass')
    expect(text).toMatch(/rehous|replacement back|replaced back/)
  })

  it('words the SIM tray question so "none" does not read as ruling a model out (§6.1)', () => {
    const help = questionById('sim_tray')?.help?.toLowerCase() ?? ''
    expect(help).toMatch(/rules nothing out|does not rule|not rule/)
  })

  it('says the camera bump comparison is relative (§6.2)', () => {
    const help = questionById('camera_bump_size')?.help?.toLowerCase() ?? ''
    expect(help).toMatch(/comparison|relative/)
    expect(help).toMatch(/same camera arrangement|same layout|side by side/)
  })

  it('keeps spec cross-references out of text the technician reads', () => {
    for (const question of questions) {
      const visible = [
        question.prompt,
        question.help ?? '',
        ...question.options.map((option) => `${option.label} ${option.caveat ?? ''}`),
      ].join(' ')
      expect(visible, question.id).not.toMatch(/§|SPEC\.md|D-\d\d/)
    }
  })
})

describe('questions and the matrix agree', () => {
  it('offers an option for every value the matrix actually uses', () => {
    for (const model of models) {
      for (const [attribute, values] of Object.entries(model.attributes)) {
        const offered = new Set(
          questionById(attribute)?.options.map((option) => option.value) ?? [],
        )
        for (const value of values ?? []) {
          expect(
            offered.has(value),
            `${model.id}.${attribute} = \`${value}\` is unreachable: no question offers it`,
          ).toBe(true)
        }
      }
    }
  })

  it('offers no option that no model can take', () => {
    // Not a correctness bug, but a dead option wastes a technician's time and
    // usually means the matrix or the schema has drifted.
    for (const question of questions) {
      const used = new Set(
        models.flatMap((model) => model.attributes[question.id] ?? []),
      )
      for (const option of question.options) {
        expect(
          used.has(option.value),
          `${question.id}.${option.value} matches no model`,
        ).toBe(true)
      }
    }
  })
})

describe('questionById', () => {
  it('finds every question, and nothing else', () => {
    for (const question of questions) expect(questionById(question.id)).toBe(question)
    expect(questionById('not_an_attribute')).toBeUndefined()
  })
})
