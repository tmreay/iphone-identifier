/**
 * State-machine invariants — an exhaustive walk of the identify flow.
 *
 * Phase 2 went through two rounds of review, and every finding had the same
 * shape: a property SPEC.md *states* that nothing checked as a consequence. The
 * tests asserted the value existed, the flag was `true`, the selector stopped —
 * never the property the spec claims those things buy. Both reviews closed the
 * gap by hand-walking one concrete device, which worked, and does not scale to
 * Phase 3 putting a UI on top of `back`, `unskip`, `revisitable` and
 * `narrowFurther`.
 *
 * So this walks the machine instead: breadth-first over every state reachable
 * from `startOver()`, checking the invariants at each one. Fixture-based rather
 * than over the real matrix on purpose — the subject is the algebra of the
 * state machine, and `reachability.test.ts` already plays the real data.
 *
 * Two walks, because "reachable" has two readings:
 *
 *   - **legal play** — acting only on what `resolve` currently offers, which is
 *     all a UI can do;
 *   - **free API** — any well-formed engine call, which is what a caller
 *     assembling its own `IdentifyState` can do. Phase 3 restoring a saved
 *     session is exactly that caller.
 *
 * The invariants are the same under both. Invariant A used to hold only under
 * the first reading — see the note above `revisitableSkips` (D-18).
 */
import { describe, expect, it } from 'vitest'
import type { AttributeId } from '../data/types.ts'
import { model, question } from './fixtures.ts'
import {
  answer,
  availableQuestions,
  back,
  canGoBack,
  narrowFurther,
  resolve,
  skip,
  startOver,
  unskip,
} from './index.ts'
import type { IdentifyResult, IdentifyState } from './types.ts'

/**
 * Four models over two coarse and two deep questions.
 *
 * Chosen to put every status on the walk: `port` splits the set but leaves a
 * pair the coarse tier cannot finish, so _Narrow further_ is on the path, and
 * `body` gives the coarse tier a second thing to say. `d` records no `logo`, so
 * the missing-data rule of §5.4 is walked rather than assumed away.
 */
const models = [
  model('a', {
    port: ['usb_c'],
    body: ['large'],
    lidar: ['present'],
    logo: ['centred'],
  }),
  model('b', {
    port: ['usb_c'],
    body: ['large'],
    lidar: ['absent'],
    logo: ['centred'],
  }),
  model('c', {
    port: ['lightning'],
    body: ['small'],
    lidar: ['absent'],
    logo: ['high'],
  }),
  model('d', { port: ['lightning'], body: ['large'], lidar: ['absent'] }),
]

const questions = [
  question('port', ['usb_c', 'lightning'], { priority: 90 }),
  question('body', ['small', 'large'], { priority: 70 }),
  question('lidar', ['present', 'absent'], { tier: 'deep', priority: 30 }),
  question('logo', ['centred', 'high'], { tier: 'deep', priority: 20 }),
]

const read = (state: IdentifyState): IdentifyResult => resolve(models, questions, state)

/** Identity of a state for the visited set. The order of steps is significant. */
function key(state: IdentifyState): string {
  const steps = state.steps
    .map((step) => `${step.attribute}=${step.value ?? 'skip'}@${step.tier}`)
    .join(',')
  return `${state.tier}|${steps}`
}

/** A state and the screen it produces, so the invariants can read both. */
interface Visited {
  state: IdentifyState
  result: IdentifyResult
  /** How the walk got here, for failure messages. */
  path: string
}

type Moves = (state: IdentifyState, result: IdentifyResult) => [string, IdentifyState][]

/**
 * Everything a technician can do on the screen in front of them: answer or skip
 * the question being asked, take the _Narrow further_ tap when it is offered,
 * take up a revisit offer, go back.
 *
 * Driven by `result` rather than by the question list, deliberately. The point
 * of this walk is that it can only act on what the engine currently offers,
 * which is the constraint the UI is under too.
 */
const legalMoves: Moves = (state, result) => {
  const moves: [string, IdentifyState][] = []
  const asked = result.question
  if (asked) {
    for (const option of asked.options) {
      moves.push([`${asked.id}=${option.value}`, answer(state, asked.id, option.value)])
    }
    moves.push([`${asked.id}=skip`, skip(state, asked.id)])
  }
  if (result.status === 'narrow-further') moves.push(['narrow', narrowFurther(state)])
  for (const attribute of result.revisitable) {
    moves.push([`unskip ${attribute}`, unskip(state, attribute)])
  }
  if (canGoBack(state)) moves.push(['back', back(state)])
  return moves
}

/**
 * Every well-formed engine call, offered or not: answer or skip any unsettled
 * question regardless of tier, revive any skip, narrow at any time, go back.
 *
 * The gap between this and `legalMoves` is the API-robustness boundary. A UI
 * can only skip a question it was asked, and deep questions are only asked on
 * the deep tier (D-03), so a deep skip recorded on the coarse tier is
 * unreachable by play and one call away for a caller building its own state.
 */
const freeMoves: Moves = (state) => {
  const moves: [string, IdentifyState][] = []
  const settled = new Set<AttributeId>(state.steps.map((step) => step.attribute))
  for (const asked of questions) {
    if (settled.has(asked.id)) continue
    for (const option of asked.options) {
      moves.push([`${asked.id}=${option.value}`, answer(state, asked.id, option.value)])
    }
    moves.push([`${asked.id}=skip`, skip(state, asked.id)])
  }
  for (const step of state.steps) {
    if (step.value === null) {
      moves.push([`unskip ${step.attribute}`, unskip(state, step.attribute)])
    }
  }
  if (state.tier === 'coarse') moves.push(['narrow', narrowFurther(state)])
  if (canGoBack(state)) moves.push(['back', back(state)])
  return moves
}

/** Breadth-first over every state the given moves reach from `startOver()`. */
function explore(moves: Moves): Visited[] {
  const start = startOver()
  const first: Visited = { state: start, result: read(start), path: 'start' }
  const seen = new Map<string, Visited>([[key(start), first]])
  let frontier = [first]

  while (frontier.length > 0) {
    const next: Visited[] = []
    for (const here of frontier) {
      for (const [label, state] of moves(here.state, here.result)) {
        const id = key(state)
        if (seen.has(id)) continue
        const visited: Visited = {
          state,
          result: read(state),
          path: `${here.path} → ${label}`,
        }
        seen.set(id, visited)
        next.push(visited)
      }
    }
    frontier = next
  }
  return [...seen.values()]
}

const played = explore(legalMoves)
const free = explore(freeMoves)

/**
 * Runs one check over a whole walk, naming the path that reached the failure.
 * An invariant that breaks three hundred states in is not much use without the
 * moves that got there.
 */
function everywhere(walk: Visited[], check: (visited: Visited) => void): void {
  for (const visited of walk) {
    try {
      check(visited)
    } catch (failure) {
      throw new Error(`at ${visited.path}\n\n${(failure as Error).message}`, {
        cause: failure,
      })
    }
  }
}

describe('the walk covers the machine', () => {
  it('reaches every status a technician can land on', () => {
    const statuses = new Set(played.map((visited) => visited.result.status))
    expect([...statuses].sort()).toEqual([
      'ambiguous',
      'asking',
      'narrow-further',
      'resolved',
    ])
  })

  it('reaches a contradictory state only once the API is called freely', () => {
    // `resolve` only ever offers a question the candidates can still answer, so
    // no answer the UI is able to give empties the set. Reaching it at all
    // takes a caller that picks its own question.
    expect(played.some((visited) => visited.result.status === 'contradictory')).toBe(
      false,
    )
    expect(free.some((visited) => visited.result.status === 'contradictory')).toBe(true)
  })

  it('explores enough states to be worth calling exhaustive', () => {
    expect(played.length).toBeGreaterThan(100)
    expect(free.length).toBeGreaterThan(played.length)
  })

  it('offers a revisit on both walks, so invariant A is not vacuous', () => {
    expect(
      played.filter((visited) => visited.result.revisitable.length > 0).length,
    ).toBeGreaterThan(0)
    expect(
      free.filter((visited) => visited.result.revisitable.length > 0).length,
    ).toBeGreaterThan(0)
  })
})

describe.each([
  ['legal play', played],
  ['free API calls', free],
])('invariants under %s', (_reading, walk) => {
  it('A. every revisitable attribute is askable once unskipped', () => {
    everywhere(walk, ({ state, result }) => {
      for (const attribute of result.revisitable) {
        const revived = unskip(state, attribute)
        expect(
          availableQuestions(questions, revived).map((asked) => asked.id),
          `${attribute} was offered as revisitable but stays out of the pool`,
        ).toContain(attribute)

        // §4.2 offers that revisiting *works*, not merely that the question
        // rejoins a pool. Skipping whatever the selector prefers first
        // eliminates nothing, so a question that still splits the candidates
        // has to come up before the pool runs out.
        let driven = revived
        let asked: AttributeId | undefined
        for (let pass = 0; pass < questions.length; pass += 1) {
          asked = read(driven).question?.id
          if (asked === undefined || asked === attribute) break
          driven = skip(driven, asked)
        }
        expect(asked, `taking up the offer to revisit ${attribute} never asks it`).toBe(
          attribute,
        )
      }
    })
  })

  it('B. back() removes at most one step and never adds one', () => {
    everywhere(walk, ({ state }) => {
      const { steps } = back(state)
      expect(steps.length).toBeGreaterThanOrEqual(state.steps.length - 1)
      expect(steps).toEqual(state.steps.slice(0, steps.length))
    })
  })

  it('C. back() never pops a step and changes tier in one call', () => {
    everywhere(walk, ({ state }) => {
      const undone = back(state)
      const popped = undone.steps.length !== state.steps.length
      const moved = undone.tier !== state.tier
      expect(popped && moved, 'one Back undid two things').toBe(false)
    })
  })

  it("D. status is 'asking' exactly when there is a question", () => {
    everywhere(walk, ({ result }) => {
      expect(result.status === 'asking').toBe(result.question !== undefined)
    })
  })

  it('E. repeated back() unwinds to the initial state from anywhere', () => {
    everywhere(walk, ({ state }) => {
      let unwinding = state
      // Every Back either pops a step or drops the tier, so one tap per step
      // plus one for the tier is enough; the spare catches a Back that stalls.
      for (let tap = 0; tap < state.steps.length + 2; tap += 1) {
        if (!canGoBack(unwinding)) break
        unwinding = back(unwinding)
      }
      expect(canGoBack(unwinding), 'Back stopped making progress').toBe(false)
      expect(unwinding).toEqual(startOver())
    })
  })

  it('F. a settled attribute is never offered again', () => {
    everywhere(walk, ({ state, result }) => {
      const settled = new Set<AttributeId>(state.steps.map((step) => step.attribute))
      for (const asked of availableQuestions(questions, state)) {
        expect(settled.has(asked.id), `${asked.id} is settled but still offered`).toBe(
          false,
        )
      }
      if (result.question) expect(settled.has(result.question.id)).toBe(false)
    })
  })

  it('G. narrow-further is never reported while already on the deep tier', () => {
    everywhere(walk, ({ state, result }) => {
      if (result.status === 'narrow-further') expect(state.tier).toBe('coarse')
    })
  })
})
