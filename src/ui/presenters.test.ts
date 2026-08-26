/**
 * Tests for the display text — SPEC.md §4.1, §4.2, §4.4.
 *
 * The components are thin enough to read; the sentences are not, and a wrong
 * one misleads a technician who has no way to check it. These run against the
 * real question set and matrix wherever the wording depends on them.
 */
import { describe, expect, it } from 'vitest'
import { attributes } from '../data/attributes.ts'
import { models } from '../data/models.ts'
import { questions } from '../data/questions.ts'
import type { IPhoneModel } from '../data/types.ts'
import { answer, narrowFurther, resolve, skip, startOver } from '../engine/index.ts'
import type { IdentifyResult, IdentifyState, Step } from '../engine/types.ts'
import {
  ambiguityStatement,
  attributeLabel,
  breadcrumbTrail,
  candidateCount,
  candidateSummary,
  candidateStrip,
  entryBackLabel,
  flowStageLabel,
  listPhrase,
  revisitPrompt,
  shortModelName,
  trailEntries,
  visibleOptions,
} from './presenters.ts'

const modelNamed = (name: string): IPhoneModel => {
  const found = models.find((model) => model.name === name)
  if (!found) throw new Error(`No model named ${name}`)
  return found
}

describe('attributeLabel', () => {
  it('reads every attribute in the schema as English', () => {
    for (const attribute of attributes) {
      const label = attributeLabel(attribute.id)
      expect(label, attribute.id).not.toMatch(/_/)
      expect(label.length, attribute.id).toBeGreaterThan(0)
    }
  })

  it('keeps names that are not words in their own case', () => {
    expect(attributeLabel('sim_tray')).toBe('SIM tray')
    expect(attributeLabel('magsafe')).toBe('MagSafe')
    expect(attributeLabel('lidar')).toBe('LiDAR')
  })

  it('renders the rest as the id already reads', () => {
    expect(attributeLabel('rear_wordmark')).toBe('rear wordmark')
    expect(attributeLabel('bottom_mic_hole_pattern')).toBe('bottom mic hole pattern')
    expect(attributeLabel('colour')).toBe('colour')
  })
})

describe('listPhrase', () => {
  it('joins nothing, one, two and three', () => {
    expect(listPhrase([])).toBe('')
    expect(listPhrase(['a'])).toBe('a')
    expect(listPhrase(['a', 'b'])).toBe('a and b')
    expect(listPhrase(['a', 'b', 'c'])).toBe('a, b and c')
  })
})

const firstTrailEntry = (steps: Step[]) => {
  const [entry] = trailEntries(questions, steps)
  if (!entry) throw new Error('Expected a trail entry')
  return entry
}

describe('trailEntries', () => {
  it('renders an answer as the option label the technician tapped', () => {
    const steps: Step[] = [{ attribute: 'port', value: 'usb_c', tier: 'coarse' }]
    const entry = firstTrailEntry(steps)
    const question = questions.find((candidate) => candidate.id === 'port')
    const option = question?.options.find((candidate) => candidate.value === 'usb_c')

    expect(entry.prompt).toBe(question?.prompt)
    expect(entry.answer).toBe(option?.label)
    expect(entry.label).toBe('port')
  })

  it('marks a skip as an unanswered question rather than dropping it', () => {
    const steps: Step[] = [{ attribute: 'colour', value: null, tier: 'coarse' }]
    const entry = firstTrailEntry(steps)

    expect(entry.answer).toBeNull()
    expect(entry.label).toBe('colour')
  })

  it('keeps the order the steps were taken in', () => {
    const steps: Step[] = [
      { attribute: 'home_button', value: 'absent', tier: 'coarse' },
      { attribute: 'colour', value: null, tier: 'coarse' },
      { attribute: 'port', value: 'usb_c', tier: 'coarse' },
    ]
    expect(trailEntries(questions, steps).map((entry) => entry.attribute)).toEqual([
      'home_button',
      'colour',
      'port',
    ])
  })
})

describe('revisitPrompt', () => {
  const pair = [modelNamed('iPhone 16'), modelNamed('iPhone 17')]

  it('says nothing when there is nothing to revisit', () => {
    expect(revisitPrompt(pair, [], 'ambiguous')).toBeNull()
  })

  it('claims "only" when the skip is genuinely all that is left', () => {
    expect(revisitPrompt(pair, ['rear_wordmark'], 'ambiguous')).toBe(
      'These two differ only by rear wordmark, which you skipped.',
    )
  })

  it('drops "only" while the deep tier can still split the group', () => {
    // §4.3 has more to ask at this point, so "only" would overstate what
    // taking up the offer settles.
    const sentence = revisitPrompt(pair, ['colour'], 'narrow-further')
    expect(sentence).not.toMatch(/only/)
    expect(sentence).toBe(
      'These two can still be told apart by colour, which you skipped.',
    )
  })

  it('names every skipped attribute, not just the first', () => {
    expect(revisitPrompt(pair, ['colour', 'sim_tray'], 'ambiguous')).toBe(
      'These two differ only by colour and SIM tray, which you skipped.',
    )
  })

  it('counts groups larger than a pair', () => {
    const three = [...pair, modelNamed('iPhone 15')]
    expect(revisitPrompt(three, ['colour'], 'ambiguous')).toMatch(
      /^These 3 differ only/,
    )
  })
})

describe('ambiguityStatement', () => {
  it('names both models of a terminal pair and says so plainly (§4.4)', () => {
    const se = [
      modelNamed('iPhone SE (2nd generation)'),
      modelNamed('iPhone SE (3rd generation)'),
    ]
    expect(ambiguityStatement(se, [])).toBe(
      'iPhone SE (2nd generation) or iPhone SE (3rd generation) — no characteristic recorded here distinguishes them.',
    )
  })

  it('lists a group of three', () => {
    const three = [
      modelNamed('iPhone 8'),
      modelNamed('iPhone SE (2nd generation)'),
      modelNamed('iPhone SE (3rd generation)'),
    ]
    expect(ambiguityStatement(three, [])).toMatch(
      /^iPhone 8, iPhone SE \(2nd generation\) and iPhone SE \(3rd generation\) —/,
    )
  })

  it('says nothing while a skipped attribute could still split the group', () => {
    // Walking to iPhone 16 vs 17 with colour skipped reaches `ambiguous` with
    // colour revisitable (§9: the finishes they do not share separate them).
    // Claiming nothing distinguishes them there contradicts the offer to
    // revisit colour printed directly below it.
    const pair = [modelNamed('iPhone 16'), modelNamed('iPhone 17')]
    expect(ambiguityStatement(pair, ['colour'])).toBeNull()
  })

  it('never contradicts the revisit offer on the same screen', () => {
    const pair = [modelNamed('iPhone 16'), modelNamed('iPhone 17')]
    for (const revisitable of [[], ['colour'], ['colour', 'sim_tray']]) {
      const terminal = ambiguityStatement(pair, revisitable)
      const offer = revisitPrompt(pair, revisitable, 'ambiguous')
      expect(terminal === null || offer === null, JSON.stringify(revisitable)).toBe(
        true,
      )
    }
  })
})

describe('candidateCount', () => {
  it('agrees with itself on singular and plural', () => {
    expect(candidateCount(37, 37)).toBe('37 of 37 models match')
    expect(candidateCount(1, 37)).toBe('1 of 37 models matches')
  })
})

describe('visibleOptions', () => {
  const questionNamed = (id: string) => {
    const found = questions.find((question) => question.id === id)
    if (!found) throw new Error(`No question for ${id}`)
    return found
  }

  it('shows every option while the whole matrix is in play', () => {
    const port = questionNamed('port')
    expect(visibleOptions(port, models)).toEqual(port.options)
  })

  it('hides values no remaining candidate can take', () => {
    const port = questionNamed('port')
    const lightningOnly = models.filter((model) =>
      (model.attributes.port ?? []).every((value) => value === 'lightning'),
    )
    expect(visibleOptions(port, lightningOnly).map((option) => option.value)).toEqual([
      'lightning',
    ])
  })

  it('never hides a value a candidate actually records', () => {
    // The safety property: an option the phone in hand could truthfully match
    // must stay tappable, or the flow can only be completed by lying.
    for (const question of questions) {
      const visible = new Set(
        visibleOptions(question, models).map((option) => option.value),
      )
      for (const model of models) {
        for (const value of model.attributes[question.id] ?? []) {
          expect(visible.has(value), `${question.id}=${value}`).toBe(true)
        }
      }
    }
  })

  it('falls back to the full list when no candidate records the attribute', () => {
    const wordmark = questionNamed('rear_wordmark')
    const blank = models.map((model) => ({ ...model, attributes: {} }))
    expect(visibleOptions(wordmark, blank)).toEqual(wordmark.options)
  })
})

describe('entryBackLabel', () => {
  it('names where the button goes, not what will be there', () => {
    expect(entryBackLabel('list')).toBe('All models')
    expect(entryBackLabel('identify')).toBe('Back to identifying')
  })

  it('promises nothing about the screen it returns to', () => {
    // All three of the question, group and result screens hand out
    // `from: 'identify'`, and a reload returns to a fresh run, so a label
    // naming any one of them would be wrong two thirds of the time.
    for (const wrong of ['question', 'group', 'result']) {
      expect(entryBackLabel('identify')).not.toContain(wrong)
    }
  })
})

describe('candidateSummary', () => {
  it('labels the strip with the count it hides', () => {
    expect(candidateSummary(12, 37)).toBe('12 of 37 candidates')
    expect(candidateSummary(37, 37)).toBe('37 of 37 candidates')
  })

  it('says the same number the spoken sentence says', () => {
    // Two readings of one fact, one on a button and one in a live region. They
    // are allowed to differ in wording and never in number.
    expect(candidateSummary(1, 37)).toContain('1 of 37')
    expect(candidateCount(1, 37)).toContain('1 of 37')
  })
})

describe('shortModelName', () => {
  it('drops the prefix every name in the matrix shares', () => {
    expect(shortModelName('iPhone 13 Pro Max')).toBe('13 Pro Max')
    expect(shortModelName('iPhone Air')).toBe('Air')
    expect(shortModelName('iPhone 16e')).toBe('16e')
  })

  it('shortens the SE names without dropping which generation', () => {
    expect(shortModelName('iPhone SE (2nd generation)')).toBe('SE (2nd)')
    expect(shortModelName('iPhone SE (3rd generation)')).toBe('SE (3rd)')
  })

  it('leaves every real model distinguishable from every other', () => {
    // The strip is only honest if two chips never read the same. A shortening
    // that collided would show one model eliminated and another still lit under
    // a name the technician cannot tell apart.
    const shortened = models.map((model) => shortModelName(model.name))
    expect(new Set(shortened).size).toBe(models.length)
    for (const short of shortened) expect(short.length).toBeGreaterThan(0)
  })
})

describe('candidateStrip', () => {
  it('carries every model in matrix order, whatever is left', () => {
    const strip = candidateStrip(models, [modelNamed('iPhone 13')])
    expect(strip).toHaveLength(models.length)
    expect(strip.map((entry) => entry.id)).toEqual(models.map((model) => model.id))
  })

  it('lights exactly the candidates and dims the rest', () => {
    const candidates = [modelNamed('iPhone 13'), modelNamed('iPhone 14')]
    const strip = candidateStrip(models, candidates)
    const lit = strip.filter((entry) => entry.remaining).map((entry) => entry.name)
    expect(lit).toEqual(['iPhone 13', 'iPhone 14'])
    expect(strip.filter((entry) => !entry.remaining)).toHaveLength(models.length - 2)
  })

  it('lights all 37 before the first answer', () => {
    const strip = candidateStrip(models, models)
    expect(strip.every((entry) => entry.remaining)).toBe(true)
  })

  it('agrees with the count sentence it sits under', () => {
    // The strip and the live region are two readings of one number, and the
    // sentence is what a screen reader gets instead of the chips.
    const candidates = models.slice(0, 5)
    const strip = candidateStrip(models, candidates)
    const lit = strip.filter((entry) => entry.remaining).length
    expect(candidateCount(candidates.length, models.length)).toContain(`${lit} of 37`)
  })
})

describe('breadcrumbTrail', () => {
  const run = (state: IdentifyState): IdentifyResult =>
    resolve(models, questions, state)
  const labels = (crumbs: { label: string }[]) => crumbs.map((crumb) => crumb.label)
  const fresh = startOver()
  const answered: IdentifyState = {
    steps: [{ attribute: 'port', value: 'usb_c', tier: 'coarse' }],
    tier: 'coarse',
  }

  /** A run driven to one model, answered as that phone actually is. */
  const resolvedRun = (name: string): IdentifyState => {
    const target = modelNamed(name)
    let state = startOver()
    for (let guard = 0; guard < questions.length * 2; guard += 1) {
      const step = run(state)
      if (step.status !== 'asking' || !step.question) break
      const value = target.attributes[step.question.id]?.[0]
      state =
        value === undefined
          ? skip(state, step.question.id)
          : answer(state, step.question.id, value)
    }
    return state
  }

  it('roots every trail at a fresh identification', () => {
    // The one crumb that is on every screen: the next phone on the bench. What
    // tapping it does depends on whether there is a run to discard — see the
    // guard below.
    const trails = [
      breadcrumbTrail({ view: 'identify' }, fresh, run(fresh)),
      breadcrumbTrail({ view: 'models' }, fresh, run(fresh)),
      breadcrumbTrail(
        { view: 'model', id: 'iphone-13', from: 'list' },
        fresh,
        run(fresh),
        modelNamed('iPhone 13'),
      ),
    ]
    for (const crumbs of trails) {
      expect(crumbs[0]?.key).toBe('root')
      expect(crumbs[0]?.label).toBe('New identification')
    }
  })

  it('names the question the flow is on', () => {
    const crumbs = breadcrumbTrail({ view: 'identify' }, fresh, run(fresh))
    expect(crumbs).toHaveLength(2)
    expect(crumbs[1]?.label).toMatch(/^Question 1: /)
    // Where you are is stated, not offered — no target on the last crumb.
    expect(crumbs[1]?.target).toBeUndefined()
  })

  it('counts the question by the steps taken, skips included', () => {
    const state: IdentifyState = {
      steps: [
        { attribute: 'port', value: 'usb_c', tier: 'coarse' },
        { attribute: 'lidar', value: null, tier: 'coarse' },
      ],
      tier: 'coarse',
    }
    expect(flowStageLabel(state, run(state))).toMatch(/^Question 3: /)
  })

  it('shows the deep tier as a step of its own, and never as a link', () => {
    const deep = narrowFurther(fresh)
    const crumbs = breadcrumbTrail({ view: 'identify' }, deep, run(deep))
    expect(labels(crumbs)[1]).toBe('Narrow further')
    expect(crumbs[1]?.target).toBeUndefined()
    expect(crumbs).toHaveLength(3)
  })

  it('ends a resolved run on the model it resolved to', () => {
    const state = resolvedRun('iPhone 13 Pro Max')
    const result = run(state)
    expect(result.status).toBe('resolved')
    expect(flowStageLabel(state, result)).toBe('iPhone 13 Pro Max')
    expect(labels(breadcrumbTrail({ view: 'identify' }, state, result))).toEqual([
      'New identification',
      'iPhone 13 Pro Max',
    ])
  })

  it('says what a run that cannot go on is doing', () => {
    // The three statuses that end a run without one model. Built as results
    // rather than driven to, because the label is a pure read of the status and
    // `contradictory` in particular takes a run no technician would give.
    const of = (
      status: IdentifyResult['status'],
      candidates: IPhoneModel[],
    ): IdentifyResult => ({ status, candidates, revisitable: [] })

    expect(flowStageLabel(fresh, of('narrow-further', models.slice(0, 4)))).toBe(
      '4 candidates left',
    )
    expect(flowStageLabel(fresh, of('ambiguous', models.slice(0, 2)))).toBe(
      '2 candidates — ambiguous',
    )
    expect(flowStageLabel(fresh, of('contradictory', []))).toBe('No match')
  })

  it('hangs the list, then an entry opened from it, under the root', () => {
    expect(labels(breadcrumbTrail({ view: 'models' }, fresh, run(fresh)))).toEqual([
      'New identification',
      'All models',
    ])

    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13-pro-max', from: 'list' },
      fresh,
      run(fresh),
      modelNamed('iPhone 13 Pro Max'),
    )
    expect(labels(crumbs)).toEqual([
      'New identification',
      'All models',
      'iPhone 13 Pro Max',
    ])
    expect(crumbs[1]?.target).toBe('models')
  })

  it('hangs an entry opened mid-run under the run, which is still there', () => {
    // D-25: looking a model up never touched the run, so the trail says the run
    // is above you — and the crumb for it goes back to exactly where it was.
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'identify' },
      answered,
      run(answered),
      modelNamed('iPhone 13'),
    )
    expect(crumbs).toHaveLength(3)
    expect(crumbs[1]?.label).toMatch(/^Question 2: /)
    expect(crumbs[1]?.target).toBe('identify')
    expect(crumbs[2]?.label).toBe('iPhone 13')
    expect(crumbs[2]?.target).toBeUndefined()
  })

  it('keeps a standing run above the list and the entries reached from it', () => {
    // Browsing mid-run must not leave the root — which discards the run — as the
    // only step above you. The run did not stop, so the trail still shows it,
    // and its crumb is the way back that costs nothing.
    const list = breadcrumbTrail({ view: 'models' }, answered, run(answered))
    expect(labels(list)).toEqual([
      'New identification',
      flowStageLabel(answered, run(answered)),
      'All models',
    ])
    expect(list[1]?.target).toBe('identify')

    const entry = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'list' },
      answered,
      run(answered),
      modelNamed('iPhone 13'),
    )
    expect(labels(entry)).toEqual([
      'New identification',
      flowStageLabel(answered, run(answered)),
      'All models',
      'iPhone 13',
    ])
    expect(entry[2]?.target).toBe('models')
  })

  it('offers to discard a run only when there is one to discard', () => {
    // The root is the only crumb that costs work, and it sits where a reader
    // expects inert navigation — so it restarts nothing until there is
    // something to restart. Same guard as the Start over button.
    expect(breadcrumbTrail({ view: 'identify' }, fresh, run(fresh))[0]?.target).toBe(
      undefined,
    )
    expect(breadcrumbTrail({ view: 'models' }, fresh, run(fresh))[0]?.target).toBe(
      'identify',
    )
    expect(
      breadcrumbTrail({ view: 'identify' }, answered, run(answered))[0]?.target,
    ).toBe('restart')
    expect(
      breadcrumbTrail({ view: 'models' }, answered, run(answered))[0]?.target,
    ).toBe('restart')
    // Agreeing to Narrow further is a decision too, answered or not.
    const deep = narrowFurther(fresh)
    expect(breadcrumbTrail({ view: 'identify' }, deep, run(deep))[0]?.target).toBe(
      'restart',
    )
  })

  it('names no stage for a run that has none — the reload case', () => {
    // The hash survives a reload and the answer trail does not (D-25), so an
    // entry bookmarked mid-run reopens above a fresh one. `entryBackLabel`
    // refuses to promise what is on the other side for this reason; the trail
    // must not make the stronger claim by naming a question that was never
    // asked.
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'identify' },
      fresh,
      run(fresh),
      modelNamed('iPhone 13'),
    )
    expect(labels(crumbs)).toEqual(['New identification', 'iPhone 13'])
  })

  it('names the model once when the run resolved to the entry being read', () => {
    // The §4.5 link opens the entry for the model just identified, and a trail
    // saying that name twice reads as a fault rather than as a path.
    const state = resolvedRun('iPhone 13 Pro Max')
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13-pro-max', from: 'identify' },
      state,
      run(state),
      modelNamed('iPhone 13 Pro Max'),
    )
    expect(labels(crumbs)).toEqual(['New identification', 'iPhone 13 Pro Max'])

    // A different model looked up from a resolved run still hangs off the run.
    const other = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'identify' },
      state,
      run(state),
      modelNamed('iPhone 13'),
    )
    expect(labels(other)).toEqual([
      'New identification',
      'iPhone 13 Pro Max',
      'iPhone 13',
    ])
  })

  it('carries the deep tier onto an entry opened from within it', () => {
    const deep = narrowFurther(answered)
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'identify' },
      deep,
      run(deep),
      modelNamed('iPhone 13'),
    )
    expect(labels(crumbs)).toEqual([
      'New identification',
      'Narrow further',
      flowStageLabel(deep, run(deep)),
      'iPhone 13',
    ])
    expect(crumbs[1]?.target).toBeUndefined()
    expect(crumbs[2]?.target).toBe('identify')
  })

  it('says the list for a model the matrix does not have', () => {
    // A stale bookmark lands on the list (App.tsx), so the trail has to say the
    // list too rather than name a model that is not there.
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-99', from: 'identify' },
      fresh,
      run(fresh),
      undefined,
    )
    expect(labels(crumbs)).toEqual(['New identification', 'All models'])
  })

  it('gives every crumb a key of its own', () => {
    const crumbs = breadcrumbTrail(
      { view: 'model', id: 'iphone-13', from: 'identify' },
      narrowFurther(fresh),
      run(narrowFurther(fresh)),
      modelNamed('iPhone 13'),
    )
    expect(new Set(crumbs.map((crumb) => crumb.key)).size).toBe(crumbs.length)
  })
})
