/**
 * The engine's public surface — SPEC.md §5.2.
 *
 * Pure TypeScript, no React. The UI (Phase 3) should import from here rather
 * than reaching into individual modules.
 */
export { isConsistent, applyStep, candidatesFor, liveValues } from './candidates.ts'
export {
  scoreQuestion,
  availableQuestions,
  rankQuestions,
  selectNextQuestion,
} from './question-selection.ts'
export {
  startOver,
  answer,
  skip,
  narrowFurther,
  back,
  canGoBack,
  revisitableSkips,
  resolve,
} from './identify.ts'
export type {
  Step,
  IdentifyState,
  IdentifyStatus,
  IdentifyResult,
  ScoredQuestion,
} from './types.ts'
