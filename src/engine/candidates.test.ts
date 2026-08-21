/**
 * The matching rule — SPEC.md §5.4.
 *
 * The safety property under test is the "only if": missing data must never
 * eliminate. Everything else in the app is allowed to be imprecise; this is not.
 */
import { describe, expect, it } from 'vitest'
import { applyStep, candidatesFor, isConsistent, liveValues } from './candidates.ts'
import { model, question } from './fixtures.ts'

const ids = (models: { id: string }[]) => models.map((m) => m.id)

describe('isConsistent', () => {
  const withValue = model('a', { port: ['usb_c'] })
  const multiValued = model('b', { port: ['usb_c', 'lightning'] })
  const unknown = model('c', {})
  const empty = model('d', { port: [] })

  it('keeps a model whose recorded values contain the answer', () => {
    expect(isConsistent(withValue, 'port', 'usb_c')).toBe(true)
    expect(isConsistent(multiValued, 'port', 'lightning')).toBe(true)
  })

  it('eliminates a model whose recorded values exclude the answer', () => {
    expect(isConsistent(withValue, 'port', 'lightning')).toBe(false)
  })

  it('keeps a model that records nothing for the attribute', () => {
    expect(isConsistent(unknown, 'port', 'lightning')).toBe(true)
    expect(isConsistent(unknown, 'port', 'usb_c')).toBe(true)
  })

  it('treats an empty list the same as an absent one', () => {
    expect(isConsistent(empty, 'port', 'lightning')).toBe(true)
  })
})

describe('applyStep', () => {
  const models = [
    model('usb', { port: ['usb_c'] }),
    model('lightning', { port: ['lightning'] }),
    model('unknown', {}),
  ]

  it('narrows on an answer', () => {
    expect(
      ids(applyStep(models, { attribute: 'port', value: 'usb_c', tier: 'coarse' })),
    ).toEqual(['usb', 'unknown'])
  })

  it("eliminates nothing on Can't tell (§4.2)", () => {
    expect(
      ids(applyStep(models, { attribute: 'port', value: null, tier: 'coarse' })),
    ).toEqual(ids(models))
  })

  it('eliminates nothing when the question is flagged non-eliminating (§6.4)', () => {
    const soft = question('port', ['usb_c', 'lightning'], { eliminating: false })
    const step = { attribute: 'port', value: 'usb_c', tier: 'coarse' as const }
    expect(ids(applyStep(models, step, soft))).toEqual(ids(models))
  })
})

describe('candidatesFor', () => {
  const models = [
    model('a', { port: ['usb_c'], home_button: ['absent'] }),
    model('b', { port: ['usb_c'], home_button: ['present'] }),
    model('c', { port: ['lightning'], home_button: ['present'] }),
    model('d', { port: ['usb_c'] }),
  ]

  it('applies answers in sequence', () => {
    const landed = candidatesFor(models, [
      { attribute: 'port', value: 'usb_c', tier: 'coarse' },
      { attribute: 'home_button', value: 'present', tier: 'coarse' },
    ])
    // `d` survives on port and is not eliminated by home_button, which it does
    // not record — the incomplete row widens the group instead of dropping the
    // model (§5.4).
    expect(ids(landed)).toEqual(['b', 'd'])
  })

  it('returns everything for an empty run', () => {
    expect(ids(candidatesFor(models, []))).toEqual(ids(models))
  })

  it('can produce an empty set from contradictory answers', () => {
    const landed = candidatesFor(models, [
      { attribute: 'port', value: 'lightning', tier: 'coarse' },
      { attribute: 'home_button', value: 'absent', tier: 'coarse' },
    ])
    expect(landed).toEqual([])
  })
})

describe('liveValues', () => {
  it('collects every value any candidate can take', () => {
    const models = [
      model('a', { colour: ['black', 'red'] }),
      model('b', { colour: ['black'] }),
      model('c', {}),
    ]
    expect([...liveValues(models, 'colour')].sort()).toEqual(['black', 'red'])
  })

  it('is empty when no candidate records the attribute', () => {
    expect(liveValues([model('a', {})], 'colour').size).toBe(0)
  })
})
