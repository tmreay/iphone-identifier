/**
 * Matrix integrity — SPEC.md §7.
 *
 * Two of the three checks §7 names live here (the third, reachability, needs
 * the engine and lives beside it). These guard the seam between the hand-written
 * schema in `attributes.ts` and the generated matrix in `models.ts`: a typo in
 * either fails the build instead of quietly creating an eleventh camera layout
 * or a fifteenth colour that no question ever offers.
 */
import { describe, expect, it } from 'vitest'
import { attributeById, attributes, palette } from './attributes.ts'
import { models } from './models.ts'

/** D-01: iPhone 8 → iPhone 17e, including the Air, 16e and both SE generations. */
const EXPECTED_MODEL_COUNT = 37

describe('attribute schema', () => {
  it('declares each attribute once', () => {
    const ids = attributes.map((attribute) => attribute.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every attribute at least two distinct values', () => {
    for (const attribute of attributes) {
      expect(new Set(attribute.values).size, attribute.id).toBe(attribute.values.length)
      expect(attribute.values.length, attribute.id).toBeGreaterThan(1)
    }
  })

  it('splits the tiers as §6.1 and §6.2 do', () => {
    const coarse = attributes.filter((attribute) => attribute.tier === 'coarse')
    const deep = attributes.filter((attribute) => attribute.tier === 'deep')
    expect(coarse.map((attribute) => attribute.id)).toEqual([
      'home_button',
      'port',
      'rear_camera_count',
      'rear_camera_layout',
      'front_cutout',
      'body_size_class',
      'sim_tray',
      'colour',
    ])
    expect(deep).toHaveLength(10)
  })
})

describe('the matrix', () => {
  it('covers every model in scope, once', () => {
    expect(models).toHaveLength(EXPECTED_MODEL_COUNT)
    expect(new Set(models.map((model) => model.id)).size).toBe(EXPECTED_MODEL_COUNT)
    expect(new Set(models.map((model) => model.name)).size).toBe(EXPECTED_MODEL_COUNT)
  })

  it('is ordered by release year', () => {
    const years = models.map((model) => model.released)
    expect(years).toEqual([...years].sort((a, b) => a - b))
  })

  it('uses only declared attributes and declared values', () => {
    for (const model of models) {
      for (const [id, values] of Object.entries(model.attributes)) {
        const attribute = attributeById(id)
        expect(
          attribute,
          `${model.id} records unknown attribute \`${id}\``,
        ).toBeDefined()
        for (const value of values ?? []) {
          expect(
            attribute?.values,
            `${model.id}.${id} records unknown value \`${value}\``,
          ).toContain(value)
        }
      }
    }
  })

  it('records no empty or duplicated value lists', () => {
    // An empty list and an absent key both mean "unknown" under §5.4, but the
    // transcription should never emit the empty form — it hides a parse failure.
    for (const model of models) {
      for (const [id, values] of Object.entries(model.attributes)) {
        expect(values?.length, `${model.id}.${id}`).toBeGreaterThan(0)
        expect(new Set(values).size, `${model.id}.${id}`).toBe(values?.length)
      }
    }
  })

  it('leaves the unverified and not-applicable rows absent', () => {
    // reference/README.md: `bottom_mic_hole_pattern` is 🔴 unverified on every
    // model but the three whose bottom edge was photographed, and
    // `camera_bump_size` is ⚪ not applicable outside the six
    // dual_diagonal_square models. Guessing either would be a wrong answer
    // waiting to happen; absent is safe (§5.4).
    const counted = models.filter((model) => model.attributes.bottom_mic_hole_pattern)
    expect(counted.map((model) => model.id)).toEqual([
      'iphone-x',
      'iphone-xs',
      'iphone-xs-max',
    ])
    const withBumpSize = models.filter((model) => model.attributes.camera_bump_size)
    expect(withBumpSize).toHaveLength(6)
    for (const model of withBumpSize) {
      expect(model.attributes.rear_camera_layout, model.id).toEqual([
        'dual_diagonal_square',
      ])
    }
  })
})

describe('no attribute value is a superset of another', () => {
  it('never lets a truthful specific answer eliminate a model that is merely vaguer', () => {
    // The regression this guards: `bottom_mic_hole_pattern` used to carry an
    // `asymmetric` catch-all on 30 models alongside the three real counts. The
    // matching rule treats values as mutually exclusive, so a technician who
    // counted three and six on an iPhone 11 — exactly what the help text asks —
    // eliminated it and was shown an iPhone XS.
    //
    // Stated generally (D-16): within one attribute, no value may describe a
    // set of phones that another value also describes. A model that cannot be
    // pinned to a specific value must be absent, not filed under a vaguer one.
    //
    // This catches the shape by naming convention — a value that extends
    // another, as `asymmetric_three_six` extends `asymmetric`. That is a
    // heuristic, not a proof: a catch-all named without the shared prefix would
    // slip past it. It is worth having because the convention is what the
    // schema already follows, and it makes the rule visible at the point
    // someone would add the next value.
    for (const attribute of attributes) {
      for (const value of attribute.values) {
        const vaguer = attribute.values.filter(
          (other) => other !== value && value.startsWith(other),
        )
        expect(
          vaguer,
          `\`${value}\` reads as a special case of ${vaguer.map((v) => `\`${v}\``).join(', ')} on ${attribute.id}`,
        ).toEqual([])
      }
    }
  })
})

describe('colour layers agree (§5.4, §6.5)', () => {
  it('matches attributes.colour against colours[].value for every model', () => {
    for (const model of models) {
      const matched = new Set(model.attributes.colour ?? [])
      const listed = new Set(model.colours.map((colour) => colour.value))
      expect([...listed].sort(), model.id).toEqual([...matched].sort())
    }
  })

  it('gives every colour a marketing name', () => {
    for (const model of models) {
      expect(model.colours.length, model.id).toBeGreaterThan(0)
      for (const colour of model.colours) {
        expect(colour.marketing.trim(), `${model.id}.${colour.value}`).not.toBe('')
      }
    }
  })
})

describe('the palette is closed (§6.5, §7)', () => {
  it('declares every colour any model uses', () => {
    for (const model of models) {
      for (const value of model.attributes.colour ?? []) {
        expect(palette, `${model.id} uses \`${value}\``).toContain(value)
      }
    }
  })

  it('uses every colour it declares', () => {
    const used = new Set(models.flatMap((model) => model.attributes.colour ?? []))
    for (const value of palette) {
      expect(used.has(value), `palette value \`${value}\` is used by no model`).toBe(
        true,
      )
    }
  })

  it('is the fourteen values Phase 1 settled on', () => {
    expect(palette).toHaveLength(14)
    expect(new Set(palette).size).toBe(14)
  })
})
