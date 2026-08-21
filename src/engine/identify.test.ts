/**
 * The identify flow — SPEC.md §4.1 to §4.4.
 */
import { describe, expect, it } from 'vitest'
import {
  answer,
  back,
  canGoBack,
  narrowFurther,
  resolve,
  revisitableSkips,
  skip,
  startOver,
} from './identify.ts'
import { model, question } from './fixtures.ts'

const models = [
  model('a', { port: ['usb_c'], lidar: ['present'] }),
  model('b', { port: ['usb_c'], lidar: ['absent'] }),
  model('c', { port: ['lightning'], lidar: ['absent'] }),
]

const questions = [
  question('port', ['usb_c', 'lightning'], { priority: 90 }),
  question('lidar', ['present', 'absent'], { tier: 'deep', priority: 10 }),
]

describe('state transitions', () => {
  it('starts with nothing answered, on the coarse tier', () => {
    expect(startOver()).toEqual({ steps: [], tier: 'coarse' })
  })

  it('records answers and skips in the order they happened', () => {
    const state = skip(answer(startOver(), 'port', 'usb_c'), 'lidar')
    expect(state.steps).toEqual([
      { attribute: 'port', value: 'usb_c', tier: 'coarse' },
      { attribute: 'lidar', value: null, tier: 'coarse' },
    ])
  })

  it('never mutates the state it is given', () => {
    const before = startOver()
    answer(before, 'port', 'usb_c')
    expect(before.steps).toEqual([])
  })

  it('goes back a step', () => {
    const state = answer(answer(startOver(), 'port', 'usb_c'), 'lidar', 'present')
    expect(back(state).steps.map((step) => step.attribute)).toEqual(['port'])
  })

  it('treats Narrow further as its own undoable step (§4.3)', () => {
    const narrowed = narrowFurther(answer(startOver(), 'port', 'usb_c'))
    expect(narrowed.tier).toBe('deep')

    const undone = back(narrowed)
    expect(undone.tier).toBe('coarse')
    // Backing out of the deep tier must not throw away the coarse answer.
    expect(undone.steps).toHaveLength(1)
  })

  it('reports whether there is anything to go back to', () => {
    expect(canGoBack(startOver())).toBe(false)
    expect(canGoBack(answer(startOver(), 'port', 'usb_c'))).toBe(true)
    expect(canGoBack(narrowFurther(startOver()))).toBe(true)
    expect(back(startOver())).toEqual(startOver())
  })
})

describe('resolve', () => {
  it('asks the best coarse question first', () => {
    const result = resolve(models, questions, startOver())
    expect(result.status).toBe('asking')
    expect(result.question?.id).toBe('port')
    expect(result.candidates).toHaveLength(3)
  })

  it('resolves to one model (§4.5)', () => {
    const result = resolve(models, questions, answer(startOver(), 'port', 'lightning'))
    expect(result.status).toBe('resolved')
    expect(result.candidates.map((candidate) => candidate.id)).toEqual(['c'])
    expect(result.question).toBeUndefined()
  })

  it('offers Narrow further when the deep tier can still split (§4.3)', () => {
    const result = resolve(models, questions, answer(startOver(), 'port', 'usb_c'))
    expect(result.status).toBe('narrow-further')
    expect(result.candidates.map((candidate) => candidate.id)).toEqual(['a', 'b'])
  })

  it('asks deep questions only after Narrow further', () => {
    const narrowed = narrowFurther(answer(startOver(), 'port', 'usb_c'))
    const result = resolve(models, questions, narrowed)
    expect(result.status).toBe('asking')
    expect(result.question?.id).toBe('lidar')
    expect(
      resolve(models, questions, answer(narrowed, 'lidar', 'present')).candidates,
    ).toEqual([models[0]])
  })

  it('declares terminal ambiguity when nothing is left to ask (§4.4)', () => {
    const twins = [model('a', { port: ['usb_c'] }), model('b', { port: ['usb_c'] })]
    const result = resolve(twins, questions, startOver())
    expect(result.status).toBe('ambiguous')
    expect(result.candidates).toHaveLength(2)
  })

  it('reports a contradictory run rather than pretending', () => {
    const result = resolve(
      [model('a', { port: ['usb_c'] })],
      questions,
      answer(startOver(), 'port', 'lightning'),
    )
    expect(result.status).toBe('contradictory')
    expect(result.candidates).toEqual([])
  })
})

describe("revisiting a Can't tell (§4.2)", () => {
  it('names the skipped attribute that is still standing between candidates', () => {
    // Skipping `port` leaves all three, and `port` would still split them.
    const state = skip(startOver(), 'port')
    const result = resolve(models, questions, state)
    expect(result.candidates).toHaveLength(3)
    expect(result.revisitable).toEqual(['port'])
  })

  it('stays quiet about a skip that no longer matters', () => {
    // `lidar` cannot tell `b` from `c`, so revisiting it would not help.
    const state = skip(answer(startOver(), 'port', 'lightning'), 'lidar')
    expect(resolve(models, questions, state).revisitable).toEqual([])
  })

  it('stays quiet once the flow has resolved', () => {
    const state = skip(startOver(), 'lidar')
    const resolved = answer(state, 'port', 'lightning')
    expect(resolve(models, questions, resolved).revisitable).toEqual([])
  })

  it('ignores answered questions — only skips are revisitable', () => {
    const state = answer(startOver(), 'port', 'usb_c')
    expect(revisitableSkips(questions, models, state)).toEqual([])
  })
})
