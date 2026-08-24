/**
 * Reverse-lookup presenters — SPEC.md §4.6.
 *
 * Run against the real matrix rather than a fixture. §4.6 puts this view in
 * front of a technician confirming a result and in front of whoever is
 * reviewing the data, so "does it hold for all 37 models" is the question worth
 * asking, and 37 is small enough to just ask it.
 */
import { describe, expect, it } from 'vitest'
import { attributes } from '../data/attributes.ts'
import { models } from '../data/models.ts'
import { questions } from '../data/questions.ts'
import {
  boundaryShadeNote,
  colourRows,
  entryRows,
  modelById,
  modelsByYear,
  rowLabel,
} from './lookup.ts'
import { attributeLabel } from './presenters.ts'

const byId = (id: string) => {
  const model = models.find((candidate) => candidate.id === id)
  if (!model) throw new Error(`no such model: ${id}`)
  return model
}

describe('entryRows', () => {
  it('shows every attribute in §6.1 then §6.2 order, colour excepted', () => {
    const expected = attributes
      .filter((attribute) => attribute.id !== 'colour')
      .map((attribute) => attribute.id)

    for (const model of models) {
      expect(
        entryRows(model, questions).map((row) => row.attribute),
        model.id,
      ).toEqual(expected)
    }
  })

  it('leaves nothing out: the rows plus the colours cover every attribute', () => {
    const model = byId('iphone-13')
    const covered = new Set(entryRows(model, questions).map((row) => row.attribute))
    expect(colourRows(model, questions).length).toBeGreaterThan(0)
    covered.add('colour')

    expect([...covered].sort()).toEqual(
      attributes.map((attribute) => attribute.id).sort(),
    )
  })

  it('words every value as the question worded it, never as a raw id', () => {
    for (const model of models) {
      for (const row of entryRows(model, questions)) {
        for (const value of row.values) {
          // The fallback in `entryRows` returns the value itself when no option
          // offers it. That is a state `questions.test.ts` already fails CI on,
          // so reaching it here means the two checks disagree.
          expect(value.label, `${model.id}.${row.attribute}`).not.toBe(value.value)
          expect(value.label, `${model.id}.${row.attribute}`).not.toMatch(/^[a-z]+_/)
        }
      }
    }
  })

  it('heads each row in English, leaving the three that are not words alone', () => {
    const labels = new Map(
      entryRows(byId('iphone-13'), questions).map((row) => [row.attribute, row.label]),
    )
    // Capitalised as a heading, but only the first character: the acronyms keep
    // the shape they already have rather than being re-cased around it.
    expect(labels.get('rear_camera_layout')).toBe('Rear camera layout')
    expect(labels.get('home_button')).toBe('Home button')
    expect(labels.get('sim_tray')).toBe('SIM tray')
    expect(labels.get('magsafe')).toBe('MagSafe')
    expect(labels.get('lidar')).toBe('LiDAR')
  })

  it('leaves the mid-sentence labels the identify flow uses untouched', () => {
    // `attributeLabel` is shared with §4.2's "differ only by rear wordmark".
    // Capitalising there would put a capital mid-sentence, so `rowLabel` is a
    // separate function and this is what stops the two being merged later.
    expect(attributeLabel('rear_wordmark')).toBe('rear wordmark')
    expect(rowLabel('rear_wordmark')).toBe('Rear wordmark')
  })

  it('carries the questions’ own diagrams (§4.6, §8)', () => {
    const optionDiagram = (attribute: string, value: string) =>
      questions
        .find((question) => question.id === attribute)
        ?.options.find((option) => option.value === value)?.diagram

    let drawn = 0
    for (const model of models) {
      for (const row of entryRows(model, questions)) {
        for (const value of row.values) {
          expect(value.diagram).toBe(optionDiagram(row.attribute, value.value))
          if (value.diagram) drawn += 1
        }
      }
    }
    // Not merely "the ids match" — that holds vacuously if every entry is
    // wordless. §4.6 asks for the drawings to actually be here.
    expect(drawn).toBeGreaterThan(0)
  })

  it('states the 65 rows the matrix does not record, rather than hiding them', () => {
    // 37 models × 18 attributes = 666 rows, of which 601 transcribe (§10): the
    // 31 ⚪ `camera_bump_size` and 34 🔴 `bottom_mic_hole_pattern` rows are
    // absent by design. Every one of them gets a row here saying so.
    const blank = models.flatMap((model) =>
      entryRows(model, questions)
        .filter((row) => row.values.length === 0)
        .map((row) => row.attribute),
    )

    expect(blank).toHaveLength(65)
    expect(new Set(blank)).toEqual(
      new Set(['camera_bump_size', 'bottom_mic_hole_pattern']),
    )
  })
})

describe('colourRows', () => {
  it('lists every colour the model shipped in, once per palette value', () => {
    for (const model of models) {
      const rows = colourRows(model, questions)
      expect(new Set(rows.map((row) => row.value)).size, model.id).toBe(rows.length)
      expect(new Set(rows.map((row) => row.value)), model.id).toEqual(
        new Set(model.colours.map((colour) => colour.value)),
      )
      expect(rows.flatMap((row) => row.marketing).sort(), model.id).toEqual(
        model.colours.map((colour) => colour.marketing).sort(),
      )
    }
  })

  it('follows palette order, not the order the reference file lists them in', () => {
    const palette = questions
      .find((question) => question.id === 'colour')
      ?.options.map((option) => option.value)
    if (!palette) throw new Error('no colour question')

    for (const model of models) {
      const positions = colourRows(model, questions).map((row) =>
        palette.indexOf(row.value),
      )
      expect(positions, model.id).toEqual([...positions].sort((a, b) => a - b))
      expect(positions, model.id).not.toContain(-1)
    }
  })

  it('groups two marketing names under one value where the palette is coarse', () => {
    const rows = colourRows(byId('iphone-15-pro'), questions)
    const silver = rows.find((row) => row.value === 'white_silver')
    expect(silver?.marketing.length).toBeGreaterThan(1)
  })
})

describe('boundaryShadeNote', () => {
  it('explains a shade recorded under two palette values', () => {
    const note = boundaryShadeNote(byId('iphone-13'))
    expect(note).toContain('Blue')
    expect(note).toContain('boundary shade')
    expect(note).toMatch(/neither answer rules this model out/)
  })

  it('says nothing where there is nothing to explain', () => {
    expect(boundaryShadeNote(byId('iphone-8'))).toBeNull()
  })

  it('fires on exactly the models whose data needs it', () => {
    const needing = models
      .filter((model) => boundaryShadeNote(model) !== null)
      .map((model) => model.id)
    expect(needing).toEqual(['iphone-13', 'iphone-13-mini'])
  })
})

describe('the browsable list', () => {
  it('holds all 37 models, in ascending release year', () => {
    const groups = modelsByYear(models)
    expect(groups.flatMap((group) => group.models)).toEqual(models)
    expect(groups.map((group) => group.year)).toEqual(
      [...groups.map((group) => group.year)].sort((a, b) => a - b),
    )
    expect(new Set(groups.map((group) => group.year)).size).toBe(groups.length)
    for (const group of groups) {
      for (const model of group.models) expect(model.released).toBe(group.year)
    }
  })

  it('finds a model by id, and does not invent one', () => {
    expect(modelById(models, 'iphone-13')?.name).toBe('iPhone 13')
    expect(modelById(models, 'iphone-99')).toBeUndefined()
  })
})
