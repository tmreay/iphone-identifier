/**
 * The identify flow — SPEC.md §4.1 to §4.4.
 *
 * A small immutable state machine over `IdentifyState`. Every screen the UI
 * needs is a pure function of that state plus the data, so Phase 3 can hold one
 * object in React state and derive the rest. Nothing here imports React.
 */
import type {
  AttributeId,
  AttributeValue,
  IPhoneModel,
  Question,
} from '../data/types.ts'
import { candidatesFor } from './candidates.ts'
import {
  availableQuestions,
  scoreQuestion,
  selectNextQuestion,
} from './question-selection.ts'
import type { IdentifyResult, IdentifyState, IdentifyStatus } from './types.ts'

/** A fresh run: no steps taken, coarse tier, all 37 models in play. */
export function startOver(): IdentifyState {
  return { steps: [], tier: 'coarse' }
}

/** Records an answer. */
export function answer(
  state: IdentifyState,
  attribute: AttributeId,
  value: AttributeValue,
): IdentifyState {
  return { ...state, steps: [...state.steps, { attribute, value, tier: state.tier }] }
}

/**
 * Records "Can't tell" (§4.2): eliminates nothing, but marks the attribute
 * permanently unavailable for this session so the flow moves on rather than
 * offering it again.
 */
export function skip(state: IdentifyState, attribute: AttributeId): IdentifyState {
  return {
    ...state,
    steps: [...state.steps, { attribute, value: null, tier: state.tier }],
  }
}

/** Moves to the deep tier — the explicit "Narrow further" tap (§4.3, D-03). */
export function narrowFurther(state: IdentifyState): IdentifyState {
  return { ...state, tier: 'deep' }
}

/**
 * Undoes one step (§4.1).
 *
 * Entering the deep tier is itself undoable: if the last thing that happened
 * was the "Narrow further" tap, _Back_ returns to the coarse tier rather than
 * discarding an answer the technician did not just give.
 */
export function back(state: IdentifyState): IdentifyState {
  const last = state.steps[state.steps.length - 1]
  if (state.tier !== (last?.tier ?? 'coarse'))
    return { ...state, tier: last?.tier ?? 'coarse' }
  if (!last) return state
  return { ...state, steps: state.steps.slice(0, -1) }
}

/** Whether the flow can go back — false only on a state nothing has happened to. */
export function canGoBack(state: IdentifyState): boolean {
  return state.steps.length > 0 || state.tier !== 'coarse'
}

/**
 * The skipped attributes that would still split the current candidates.
 *
 * §4.2: "If unresolved attributes are the only thing standing between
 * candidates, the result screen says so explicitly and offers to revisit."
 * Skips that no longer matter are left out, so the prompt only appears when
 * revisiting would actually help.
 */
export function revisitableSkips(
  questions: Question[],
  candidates: IPhoneModel[],
  state: IdentifyState,
): AttributeId[] {
  if (candidates.length <= 1) return []
  const byId = new Map(questions.map((question) => [question.id, question]))
  return state.steps
    .filter((step) => step.value === null)
    .map((step) => step.attribute)
    .filter((attribute) => {
      const question = byId.get(attribute)
      return question !== undefined && scoreQuestion(candidates, question).gain > 0
    })
}

/**
 * Everything a screen needs, derived from `state`.
 *
 * The status is the branch point in §4.1 step 5: one candidate goes to the
 * result screen, more than one goes to the group screen — with _Narrow further_
 * offered while the deep tier still has something to say (§4.3), and terminal
 * ambiguity declared plainly once it does not (§4.4).
 */
export function resolve(
  models: IPhoneModel[],
  questions: Question[],
  state: IdentifyState,
): IdentifyResult {
  const candidates = candidatesFor(models, state.steps, questions)
  const question = selectNextQuestion(questions, candidates, state)
  const revisitable = revisitableSkips(questions, candidates, state)

  return {
    status: statusOf(candidates, question, questions, state),
    candidates,
    question,
    revisitable,
  }
}

function statusOf(
  candidates: IPhoneModel[],
  question: Question | undefined,
  questions: Question[],
  state: IdentifyState,
): IdentifyStatus {
  if (candidates.length === 0) return 'contradictory'
  if (candidates.length === 1) return 'resolved'
  if (question) return 'asking'

  // More than one candidate and nothing left to ask on this tier. If the deep
  // tier can still split them, this is the "Narrow further" step rather than
  // terminal ambiguity.
  if (state.tier === 'coarse') {
    const deep = { ...state, tier: 'deep' as const }
    const splits = availableQuestions(questions, deep).some(
      (candidate) => scoreQuestion(candidates, candidate).gain > 0,
    )
    if (splits) return 'narrow-further'
  }
  return 'ambiguous'
}
