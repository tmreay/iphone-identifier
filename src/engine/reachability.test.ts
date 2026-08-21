/**
 * Reachability — the third check SPEC.md §7 requires.
 *
 * > every model is reachable — for each model there exists an answer path
 * > leading to it alone, or to a documented terminal group (§4.4).
 *
 * Phase 1 checked this by brute force over every _concrete device_: one real
 * value per attribute, so a black 128 GB iPhone 16 and a teal one are separate
 * runs. This does the same thing through the real engine and the real question
 * set, and pins the terminal groups, so a data change that creates a new one
 * fails the build rather than shipping as a silently worse answer.
 */
import { describe, expect, it } from 'vitest'
import { models } from '../data/models.ts'
import { questions } from '../data/questions.ts'
import type { AttributeId, AttributeValue, IPhoneModel } from '../data/types.ts'
import { answer, narrowFurther, resolve, skip, startOver } from './index.ts'

/**
 * A single real handset: exactly one value for every attribute the matrix
 * records for its model. Attributes the matrix leaves absent are absent here
 * too — the technician has nothing to read off, so the run skips them.
 */
interface ConcreteDevice {
  model: IPhoneModel
  values: Map<AttributeId, AttributeValue>
}

function concreteDevices(model: IPhoneModel): ConcreteDevice[] {
  const recorded = Object.entries(model.attributes).filter(
    ([, values]) => values !== undefined && values.length > 0,
  )
  let combinations: Map<AttributeId, AttributeValue>[] = [
    new Map<AttributeId, AttributeValue>(),
  ]
  for (const [attribute, values] of recorded) {
    combinations = combinations.flatMap((partial) =>
      (values ?? []).map((value) =>
        new Map<AttributeId, AttributeValue>(partial).set(attribute, value),
      ),
    )
  }
  return combinations.map((values) => ({ model, values }))
}

const devices = models.flatMap(concreteDevices)

/**
 * Plays one device all the way through: answer what it can show, skip what the
 * matrix does not record for it, tap "Narrow further" when offered. Returns the
 * candidate ids the flow lands on.
 *
 * `cantTell` forces extra questions to be skipped, standing in for a
 * characteristic the technician cannot see (§4.2).
 */
function identify(device: ConcreteDevice, cantTell: AttributeId[] = []): string[] {
  let state = startOver()

  // Generous bound: the flow settles one question per pass, and there are 18.
  for (let step = 0; step < questions.length * 2 + 4; step += 1) {
    const result = resolve(models, questions, state)

    if (result.status === 'asking' && result.question) {
      const attribute = result.question.id
      const value = device.values.get(attribute)
      state =
        value === undefined || cantTell.includes(attribute)
          ? skip(state, attribute)
          : answer(state, attribute, value)
      continue
    }

    if (result.status === 'narrow-further') {
      state = narrowFurther(state)
      continue
    }

    return result.candidates.map((candidate) => candidate.id)
  }

  throw new Error(`${device.model.id}: flow did not settle`)
}

/**
 * Orders groups by their joined ids in plain codepoint order. Not
 * `localeCompare`, which sorts `iphone-15-pro-max` ahead of `iphone-15-pro` by
 * ignoring the hyphen, and would make these assertions locale-dependent.
 */
function byIdList(a: string[], b: string[]): number {
  const [left, right] = [a.join(), b.join()]
  return left < right ? -1 : left > right ? 1 : 0
}

/** The distinct multi-model outcomes across every device, as sorted id lists. */
function terminalGroups(cantTell: AttributeId[] = []): string[][] {
  const groups = new Map<string, string[]>()
  for (const device of devices) {
    const landed = identify(device, cantTell)
    if (landed.length > 1) groups.set(landed.join(' + '), landed)
  }
  return [...groups.values()].sort(byIdList)
}

describe('every model is reachable (§7)', () => {
  it('gives every model at least one concrete device', () => {
    for (const model of models) {
      expect(concreteDevices(model).length, model.id).toBeGreaterThan(0)
    }
  })

  it('lands every device on its own model, or on a group containing it', () => {
    for (const device of devices) {
      const landed = identify(device)
      expect(landed, `${device.model.id} fell out of its own candidate set`).toContain(
        device.model.id,
      )
    }
  })

  it('resolves 35 of the 37 models to exactly one, somewhere', () => {
    const alone = new Set(
      devices
        .map((device) => identify(device))
        .filter((ids) => ids.length === 1)
        .flat(),
    )
    const never = models.map((model) => model.id).filter((id) => !alone.has(id))
    // The two SE bodies are externally identical, so no path ever isolates
    // either one (§4.4). Every other model has at least one configuration that
    // resolves alone.
    expect(never.sort()).toEqual(['iphone-se-2', 'iphone-se-3'])
  })
})

describe('terminal ambiguity is exactly what §9 documents', () => {
  it('leaves two groups after both tiers, and no others', () => {
    // §9 was written when Phase 1 scored separability on visible characteristics
    // alone, which put 16e vs 17e on this list. `magsafe` is a matrix attribute
    // (§6.2) and §4.4 asks the engine to use it, so the engine does separate
    // that pair — a puck sticks to a 17e and slides off a 16e, and that works on
    // a dead phone. Two groups remain, not three.
    expect(terminalGroups()).toEqual([
      ['iphone-16', 'iphone-17'],
      ['iphone-se-2', 'iphone-se-3'],
    ])
  })

  it('separates 16e from 17e on magsafe alone', () => {
    const e16 = models.find((model) => model.id === 'iphone-16e')
    const e17 = models.find((model) => model.id === 'iphone-17e')
    expect(e16?.attributes.magsafe).toEqual(['absent'])
    expect(e17?.attributes.magsafe).toEqual(['present'])

    // Deny the engine that one attribute and the pair goes terminal, which is
    // the group §9 records.
    expect(terminalGroups(['magsafe'])).toContainEqual(['iphone-16e', 'iphone-17e'])
  })

  it('leaves the seven groups §9 predicts when only the coarse tier is used', () => {
    const groups = new Map<string, string[]>()
    for (const device of devices) {
      let state = startOver()
      for (let step = 0; step < questions.length * 2 + 4; step += 1) {
        const result = resolve(models, questions, state)
        if (result.status === 'asking' && result.question) {
          const value = device.values.get(result.question.id)
          state =
            value === undefined
              ? skip(state, result.question.id)
              : answer(state, result.question.id, value)
          continue
        }
        // Stop at the "Narrow further" step instead of taking it.
        if (result.candidates.length > 1) {
          groups.set(
            result.candidates.map((candidate) => candidate.id).join(' + '),
            result.candidates.map((candidate) => candidate.id),
          )
        }
        break
      }
    }

    expect([...groups.values()].sort(byIdList)).toEqual([
      ['iphone-13', 'iphone-14'],
      ['iphone-15-pro', 'iphone-16-pro'],
      ['iphone-15-pro-max', 'iphone-16-pro-max'],
      ['iphone-16', 'iphone-17'],
      ['iphone-16e', 'iphone-17e'],
      ['iphone-8', 'iphone-se-2', 'iphone-se-3'],
      ['iphone-x', 'iphone-xs'],
    ])
  })
})

describe('rear_camera_count earns its place as a fallback (§6.1)', () => {
  // §6.1 asks Phase 2 to check whether the count question is pure redundancy
  // now that rear_camera_layout subsumes it. It is redundant while the layout
  // is answerable — but it is the fallback the moment the layout is not, which
  // is the case §4.2 exists for.
  it('is never the best question while the layout is answerable', () => {
    const asked = new Set<AttributeId>()
    for (const device of devices) {
      let state = startOver()
      for (let step = 0; step < questions.length * 2 + 4; step += 1) {
        const result = resolve(models, questions, state)
        if (result.status === 'asking' && result.question) {
          asked.add(result.question.id)
          const value = device.values.get(result.question.id)
          state =
            value === undefined
              ? skip(state, result.question.id)
              : answer(state, result.question.id, value)
          continue
        }
        if (result.status === 'narrow-further') {
          state = narrowFurther(state)
          continue
        }
        break
      }
    }
    expect(asked.has('rear_camera_count')).toBe(false)
  })

  it('holds separability together when the layout is skipped', () => {
    expect(terminalGroups(['rear_camera_layout'])).toEqual([
      ['iphone-16', 'iphone-17'],
      ['iphone-se-2', 'iphone-se-3'],
    ])
  })
})
