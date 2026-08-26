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
import type { Step } from '../engine/types.ts'
import {
  ambiguityStatement,
  attributeLabel,
  candidateCount,
  candidateSummary,
  candidateStrip,
  entryBackLabel,
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
