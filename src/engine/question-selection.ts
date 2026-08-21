/**
 * Question selection — SPEC.md §7.
 *
 * Given the current candidate set:
 *   1. consider only unanswered, unskipped questions of the active tier;
 *   2. score each by information gain — the expected reduction in candidate
 *      count, treating remaining models as equally likely;
 *   3. break ties by `priority`, so quick whole-hand checks win over checks
 *      that need close inspection;
 *   4. stop when one candidate remains, or no question can further split
 *      the set.
 *
 * The algorithm is deterministic: every comparison falls through to the
 * attribute id, so the same candidate set always yields the same question.
 */
import type { AttributeId, IPhoneModel, Question } from '../data/types.ts'
import { isConsistent, liveValues } from './candidates.ts'
import type { IdentifyState, ScoredQuestion } from './types.ts'

/**
 * Float slack for gain comparisons, so ties are ties rather than noise.
 *
 * Not cosmetic. `scoreQuestion` sums `1/values.length` per candidate, and three
 * or more equal shares do not sum to exactly 1 in IEEE754 — two models with
 * identical six-value colour sets score a gain of 2.2e-16 on a question that
 * provably cannot separate them. Anything asking "can this split the set?" must
 * go through `splits`, never a bare `> 0`.
 */
const EPSILON = 1e-9

/**
 * Whether `question` can actually narrow `models`.
 *
 * The single answer to "is this question worth anything here?" — used by the
 * selector, by the "Narrow further" decision and by the revisit prompt, so the
 * three cannot disagree about the same question.
 */
export function splits(models: IPhoneModel[], question: Question): boolean {
  return scoreQuestion(models, question).gain > EPSILON
}

/**
 * Expected candidate count after `question` is answered.
 *
 * "Treating remaining models as equally likely" needs one step of care, because
 * a model can hold several values for an attribute — five colours, two size
 * classes, both SIM-tray bodies — so the answers do not partition the set. The
 * probability of each answer is therefore built model-first: each candidate is
 * equally likely, and a candidate holding _n_ values for this attribute
 * contributes 1/n to each of them.
 *
 * Candidates with no recorded value survive every answer (§5.4) and so appear
 * in every branch. That is deliberate: it makes a question over sparse data
 * score _worse_ than one over complete data, which is exactly the preference
 * we want.
 */
export function scoreQuestion(
  models: IPhoneModel[],
  question: Question,
): ScoredQuestion {
  const attribute = question.id
  const known = models.filter((model) => (model.attributes[attribute]?.length ?? 0) > 0)

  // A non-eliminating question removes nothing by definition (§6.4), so it has
  // no gain to offer under a metric defined as expected reduction in candidate
  // count — and scoring it as though it did is what would let the §6.4 revert
  // leave colour asked early and prominently for no benefit.
  //
  // Nothing recorded this attribute, so no answer can tell the candidates
  // apart. Same result for a set of one, where there is nothing left to split.
  if (!question.eliminating || known.length === 0 || models.length <= 1) {
    return { attribute, gain: 0, expectedRemaining: models.length }
  }

  const live = liveValues(models, attribute)
  let expectedRemaining = 0

  for (const value of live) {
    let weight = 0
    for (const model of known) {
      const values = model.attributes[attribute]
      if (values && values.includes(value)) weight += 1 / values.length
    }
    if (weight === 0) continue

    const survivors = models.filter((model) =>
      isConsistent(model, attribute, value),
    ).length
    expectedRemaining += (weight / known.length) * survivors
  }

  return {
    attribute,
    gain: models.length - expectedRemaining,
    expectedRemaining,
  }
}

/** Questions still in play for `state`: right tier, not answered, not skipped. */
export function availableQuestions(
  questions: Question[],
  state: IdentifyState,
): Question[] {
  const settled = new Set<AttributeId>(state.steps.map((step) => step.attribute))
  return questions.filter(
    (question) => question.tier === state.tier && !settled.has(question.id),
  )
}

/**
 * Every question still in play, best first. Ranked by information gain, then by
 * `priority`, then by attribute id so the order is total and stable.
 */
export function rankQuestions(
  questions: Question[],
  models: IPhoneModel[],
  state: IdentifyState,
): { question: Question; score: ScoredQuestion }[] {
  return availableQuestions(questions, state)
    .map((question) => ({ question, score: scoreQuestion(models, question) }))
    .sort((a, b) => {
      const byGain = b.score.gain - a.score.gain
      if (Math.abs(byGain) > EPSILON) return byGain
      const byPriority = b.question.priority - a.question.priority
      if (byPriority !== 0) return byPriority
      // Plain codepoint order, not localeCompare: the result must not depend on
      // the locale the shop's device happens to be set to.
      return a.question.id < b.question.id ? -1 : a.question.id > b.question.id ? 1 : 0
    })
}

/**
 * The next question to ask, or `undefined` when the flow should stop — one
 * candidate left, or nothing left that can split the set (§7 step 4).
 *
 * Returning `undefined` on the coarse tier is what puts the UI at the "Narrow
 * further" step (§4.3); returning it on the deep tier means terminal ambiguity
 * (§4.4).
 */
export function selectNextQuestion(
  questions: Question[],
  models: IPhoneModel[],
  state: IdentifyState,
): Question | undefined {
  if (models.length <= 1) return undefined
  const best = rankQuestions(questions, models, state)[0]
  if (!best || !splits(models, best.question)) return undefined
  return best.question
}
