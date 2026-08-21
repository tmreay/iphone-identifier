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
  unskip,
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

  it('does not name a skip that only floating-point noise makes look useful', () => {
    // Two candidates with identical three-value sets: the shares are 1/3 each
    // and do not sum to exactly 1, so a bare `gain > 0` would offer to revisit
    // a question that cannot possibly narrow the pair.
    const twins = [
      model('a', { colour: ['black', 'red', 'green'] }),
      model('b', { colour: ['black', 'red', 'green'] }),
    ]
    const colourQuestion = [question('colour', ['black', 'red', 'green'])]
    const state = skip(startOver(), 'colour')
    expect(resolve(twins, colourQuestion, state).revisitable).toEqual([])
  })
})

describe('unskip (§4.2)', () => {
  it('puts the question back without touching the answers given since', () => {
    const state = answer(
      answer(skip(startOver(), 'lidar'), 'port', 'usb_c'),
      'home',
      'x',
    )
    const revived = unskip(state, 'lidar')
    expect(revived.steps.map((step) => step.attribute)).toEqual(['port', 'home'])
    // The five-good-answers case: nothing but the skip is lost.
    expect(revived.steps).toEqual(state.steps.filter((step) => step.value !== null))
  })

  it('lets the flow ask the question again', () => {
    const skipped = skip(startOver(), 'port')
    expect(resolve(models, questions, skipped).question?.id).not.toBe('port')
    expect(resolve(models, questions, unskip(skipped, 'port')).question?.id).toBe(
      'port',
    )
  })

  it('closes the loop the result screen opens', () => {
    // What §4.2 actually promises: the screen names the attribute standing
    // between candidates, and taking up the offer narrows the group.
    const state = skip(startOver(), 'port')
    const before = resolve(models, questions, state)
    expect(before.revisitable).toEqual(['port'])
    expect(before.candidates).toHaveLength(3)

    const revived = answer(unskip(state, before.revisitable[0]!), 'port', 'lightning')
    const after = resolve(models, questions, revived)
    expect(after.status).toBe('resolved')
    expect(after.candidates.map((candidate) => candidate.id)).toEqual(['c'])
  })

  it('never touches an answered step, only a skip', () => {
    const answered = answer(startOver(), 'port', 'usb_c')
    expect(unskip(answered, 'port')).toEqual(answered)
  })

  it('is a no-op for an attribute that was never skipped', () => {
    const state = skip(startOver(), 'lidar')
    expect(unskip(state, 'port')).toEqual(state)
  })

  it('never mutates the state it is given', () => {
    const before = skip(startOver(), 'port')
    unskip(before, 'port')
    expect(before.steps).toHaveLength(1)
  })

  describe('revisiting a coarse skip from the deep tier', () => {
    // The case the same-tier tests missed. A group screen on the deep tier can
    // name a coarse skip as revisitable, so unskipping it has to actually put
    // the question back in front of the technician.
    const reachDeep = () => narrowFurther(skip(startOver(), 'port'))

    it('asks the coarse question again rather than stranding it', () => {
      const stranded = reachDeep()
      expect(resolve(models, questions, stranded).revisitable).toContain('port')

      const revived = unskip(stranded, 'port')
      expect(resolve(models, questions, revived).question?.id).toBe('port')
    })

    it('narrows on the revived answer', () => {
      const revived = answer(unskip(reachDeep(), 'port'), 'port', 'lightning')
      const result = resolve(models, questions, revived)
      expect(result.status).toBe('resolved')
      expect(result.candidates.map((candidate) => candidate.id)).toEqual(['c'])
    })

    it('leaves the tier alone, so Back cannot strand the question again', () => {
      // Rewinding the tier here would look right and then fail one tap later:
      // `back()` compares the tier against the last step's, so it would flip
      // straight back to deep — with the skip step now gone, leaving the
      // question neither offered nor revisitable.
      const revived = unskip(reachDeep(), 'port')
      expect(revived.tier).toBe('deep')
      expect(resolve(models, questions, back(revived)).question?.id).toBe('port')
    })

    it('keeps deep answers working after a coarse question is revived', () => {
      const state = answer(unskip(reachDeep(), 'port'), 'lidar', 'absent')
      expect(resolve(models, questions, state).candidates.map((c) => c.id)).toEqual([
        'b',
        'c',
      ])
    })
  })
})
