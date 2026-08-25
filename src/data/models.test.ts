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

describe('size classes are the bands the bodies actually form (§6.3, D-27)', () => {
  it('gives every declared class at least one model of its own', () => {
    // The regression this guards: the five-band schema had a `large` band —
    // ~150–156 mm — that no body sat in. It reached the screen anyway, as an
    // adjacency from `standard`, so a technician could pick a size no phone
    // was, and picking it narrowed *further* than the truthful `standard` did:
    // the iPhone 15 Pro dropped out while the 14 Pro and 16 Pro survived, on
    // nothing but which side of a 3 mm adjacency each had landed.
    //
    // A band with no members of its own is that bug. Stated as a rule: every
    // value the size question offers must be some model's *own* class.
    //
    // "Own" is the whole of it, and it is why this counts sole membership
    // rather than `includes`. Under the old data the empty band was listed by
    // eight models, every one of them alongside `standard` — so an `includes`
    // count found eight members for a band nothing was in, and passed. That is
    // the bug wearing the test's own clothes.
    const declared = attributeById('body_size_class')?.values ?? []
    expect(declared.length).toBeGreaterThan(0)
    for (const value of declared) {
      const members = models.filter((model) => {
        const classes = model.attributes.body_size_class ?? []
        return classes.length === 1 && classes[0] === value
      })
      expect(
        members.length,
        `no model is \`${value}\` and nothing else`,
      ).toBeGreaterThan(0)
    }
  })

  it('carries exactly one class per model, as the 5 mm gaps allow', () => {
    // §6.3 still permits two adjacent classes, and a future model landing in
    // one of the gaps would need them. None does today: both band boundaries
    // sit in about 5 mm of empty space, well outside the 3 mm adjacency rule.
    // So this asserts the state of the matrix, not the rule — if it fails
    // because a new model genuinely straddles a boundary, the fix is to record
    // that here, not to force the model to one class.
    for (const model of models) {
      expect(model.attributes.body_size_class, model.id).toHaveLength(1)
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

  it('spells each marketing name one way across the whole matrix', () => {
    // Phase 1 wrote `(PRODUCT)RED` eleven ways with a space and once without.
    // The engine never matches on marketing names (D-12), so it cost nothing —
    // but the reverse-lookup entry (§4.6) shows them, and one product reading
    // two ways looks like a data error to whoever is checking a phone against it.
    const byNormalised = new Map<string, Set<string>>()
    for (const model of models) {
      for (const colour of model.colours) {
        const normalised = colour.marketing.toLowerCase().replace(/\s+/g, '')
        const spellings = byNormalised.get(normalised) ?? new Set()
        spellings.add(colour.marketing)
        byNormalised.set(normalised, spellings)
      }
    }
    for (const [normalised, spellings] of byNormalised) {
      expect([...spellings], `${normalised} is spelled more than one way`).toHaveLength(
        1,
      )
    }
  })

  it('uses Apple’s own styling for (PRODUCT)RED — no space', () => {
    // Verified against the tech-spec pages cited as S1: the iPhone 8 Plus page
    // has the literal `(PRODUCT)RED&trade;`, the iPhone 11 page renders it
    // `(PRODUCT)<sup>RED</sup>`. See reference/palette.md.
    const reds = models.flatMap((model) =>
      model.colours.filter((colour) => colour.marketing.includes('PRODUCT')),
    )
    expect(reds.length).toBeGreaterThan(0)
    for (const red of reds) expect(red.marketing).toBe('(PRODUCT)RED')
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
