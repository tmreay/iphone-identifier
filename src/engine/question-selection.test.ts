/**
 * Question selection — SPEC.md §7.
 *
 * Fixtures rather than the real matrix, so the expected arithmetic is visible
 * in the test. The real matrix is exercised by `reachability.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import {
  availableQuestions,
  rankQuestions,
  scoreQuestion,
  selectNextQuestion,
} from './question-selection.ts'
import { model, question } from './fixtures.ts'
import type { IdentifyState } from './types.ts'

const coarse: IdentifyState = { steps: [], tier: 'coarse' }

describe('scoreQuestion', () => {
  it('scores an even split by how much it removes', () => {
    // Four candidates, two values, two candidates each: whichever is answered,
    // two survive. Expected remaining 2, so the gain is 2.
    const models = [
      model('a', { port: ['usb_c'] }),
      model('b', { port: ['usb_c'] }),
      model('c', { port: ['lightning'] }),
      model('d', { port: ['lightning'] }),
    ]
    const score = scoreQuestion(models, question('port', ['usb_c', 'lightning']))
    expect(score.expectedRemaining).toBeCloseTo(2)
    expect(score.gain).toBeCloseTo(2)
  })

  it('scores a lopsided split lower than an even one', () => {
    const lopsided = [
      model('a', { port: ['usb_c'] }),
      model('b', { port: ['usb_c'] }),
      model('c', { port: ['usb_c'] }),
      model('d', { port: ['lightning'] }),
    ]
    const even = [
      model('a', { port: ['usb_c'] }),
      model('b', { port: ['usb_c'] }),
      model('c', { port: ['lightning'] }),
      model('d', { port: ['lightning'] }),
    ]
    const port = question('port', ['usb_c', 'lightning'])
    expect(scoreQuestion(lopsided, port).gain).toBeLessThan(
      scoreQuestion(even, port).gain,
    )
  })

  it('scores an attribute nobody records at zero', () => {
    const models = [model('a', {}), model('b', {})]
    expect(scoreQuestion(models, question('port', ['usb_c'])).gain).toBe(0)
  })

  it('scores an attribute everybody shares at zero', () => {
    const models = [model('a', { port: ['usb_c'] }), model('b', { port: ['usb_c'] })]
    expect(scoreQuestion(models, question('port', ['usb_c', 'lightning'])).gain).toBe(0)
  })

  it('is worth less over sparse data than over complete data', () => {
    // The same split, except one candidate records nothing and so survives every
    // answer (§5.4). That must cost the question, not be invisible to it.
    const complete = [
      model('a', { port: ['usb_c'] }),
      model('b', { port: ['lightning'] }),
      model('c', { port: ['lightning'] }),
    ]
    const sparse = [
      model('a', { port: ['usb_c'] }),
      model('b', { port: ['lightning'] }),
      model('c', {}),
    ]
    const port = question('port', ['usb_c', 'lightning'])
    expect(scoreQuestion(sparse, port).gain).toBeLessThan(
      scoreQuestion(complete, port).gain,
    )
  })

  it('weights a multi-valued candidate across its values, not once per value', () => {
    // `a` ships in both colours, `b` only in black. Each candidate is equally
    // likely and spreads its 1 across its own values, so black is answered with
    // probability (1/2 + 1) / 2 = 0.75 and keeps both candidates, while red is
    // answered with probability 0.25 and keeps only `a`:
    //   0.75 × 2 + 0.25 × 1 = 1.75.
    // Counting `a` once per value instead would give black and red equal
    // weight, and the wrong answer of 1.5.
    const models = [
      model('a', { colour: ['black', 'red'] }),
      model('b', { colour: ['black'] }),
    ]
    const score = scoreQuestion(models, question('colour', ['black', 'red']))
    expect(score.expectedRemaining).toBeCloseTo(1.75)
    expect(score.gain).toBeCloseTo(0.25)
  })
})

describe('availableQuestions', () => {
  const set = [
    question('port', ['usb_c']),
    question('lidar', ['present'], { tier: 'deep' }),
    question('home_button', ['present']),
  ]

  it('offers only the active tier', () => {
    expect(availableQuestions(set, coarse).map((q) => q.id)).toEqual([
      'port',
      'home_button',
    ])
    expect(
      availableQuestions(set, { steps: [], tier: 'deep' }).map((q) => q.id),
    ).toEqual(['lidar'])
  })

  it('drops anything already answered', () => {
    const state: IdentifyState = {
      steps: [{ attribute: 'port', value: 'usb_c', tier: 'coarse' }],
      tier: 'coarse',
    }
    expect(availableQuestions(set, state).map((q) => q.id)).toEqual(['home_button'])
  })

  it("drops anything answered Can't tell, permanently (§4.2)", () => {
    const state: IdentifyState = {
      steps: [{ attribute: 'port', value: null, tier: 'coarse' }],
      tier: 'coarse',
    }
    expect(availableQuestions(set, state).map((q) => q.id)).toEqual(['home_button'])
  })
})

describe('rankQuestions', () => {
  const models = [
    model('a', { port: ['usb_c'], home_button: ['present'] }),
    model('b', { port: ['lightning'], home_button: ['absent'] }),
  ]

  it('breaks a tie on priority, higher first (§7 step 3)', () => {
    const set = [
      question('home_button', ['present', 'absent'], { priority: 10 }),
      question('port', ['usb_c', 'lightning'], { priority: 90 }),
    ]
    // Both split the pair perfectly, so only priority separates them.
    const ranked = rankQuestions(set, models, coarse)
    expect(ranked.map((r) => r.question.id)).toEqual(['port', 'home_button'])
    expect(ranked[0]?.score.gain).toBeCloseTo(ranked[1]?.score.gain ?? NaN)
  })

  it('breaks a priority tie on attribute id, so the order is total', () => {
    const set = [
      question('port', ['usb_c', 'lightning'], { priority: 50 }),
      question('home_button', ['present', 'absent'], { priority: 50 }),
    ]
    expect(rankQuestions(set, models, coarse).map((r) => r.question.id)).toEqual([
      'home_button',
      'port',
    ])
  })

  it('puts a bigger gain ahead of a higher priority', () => {
    const four = [
      model('a', { port: ['usb_c'], colour: ['black'] }),
      model('b', { port: ['usb_c'], colour: ['red'] }),
      model('c', { port: ['usb_c'], colour: ['green'] }),
      model('d', { port: ['lightning'], colour: ['blue'] }),
    ]
    const set = [
      question('port', ['usb_c', 'lightning'], { priority: 99 }),
      question('colour', ['black', 'red', 'green', 'blue'], { priority: 1 }),
    ]
    expect(rankQuestions(set, four, coarse)[0]?.question.id).toBe('colour')
  })
})

describe('selectNextQuestion', () => {
  it('stops once a single candidate remains (§7 step 4)', () => {
    const one = [model('a', { port: ['usb_c'] })]
    expect(
      selectNextQuestion([question('port', ['usb_c'])], one, coarse),
    ).toBeUndefined()
  })

  it('stops when nothing left can split the set (§7 step 4)', () => {
    const twins = [model('a', { port: ['usb_c'] }), model('b', { port: ['usb_c'] })]
    expect(
      selectNextQuestion([question('port', ['usb_c'])], twins, coarse),
    ).toBeUndefined()
  })

  it('is deterministic', () => {
    const models = [
      model('a', { port: ['usb_c'], home_button: ['present'] }),
      model('b', { port: ['lightning'], home_button: ['absent'] }),
    ]
    const set = [
      question('port', ['usb_c', 'lightning'], { priority: 50 }),
      question('home_button', ['present', 'absent'], { priority: 50 }),
    ]
    const picks = Array.from(
      { length: 5 },
      () => selectNextQuestion(set, models, coarse)?.id,
    )
    expect(new Set(picks).size).toBe(1)
  })
})
