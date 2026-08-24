/**
 * The identify flow — SPEC.md §4.1 to §4.5.
 *
 * One piece of React state: the `IdentifyState` the engine defines. Every screen
 * is a pure function of it, because `resolve()` already derives everything a
 * screen needs — status, candidates, the question to ask, the skips worth
 * revisiting. Nothing about the flow is decided here; this component routes on
 * the status and hands the engine's own actions to the buttons.
 */
import { useMemo, useState } from 'react'
import { models } from '../data/models.ts'
import { questions } from '../data/questions.ts'
import type { AttributeId, AttributeValue } from '../data/types.ts'
import {
  answer,
  back,
  canGoBack,
  narrowFurther,
  resolve,
  skip,
  startOver,
  unskip,
} from '../engine/index.ts'
import type { IdentifyState } from '../engine/types.ts'
import { AnswerTrail } from './AnswerTrail.tsx'
import { ContradictionScreen } from './ContradictionScreen.tsx'
import { GroupScreen } from './GroupScreen.tsx'
import { QuestionScreen } from './QuestionScreen.tsx'
import { ResultScreen } from './ResultScreen.tsx'

export function App() {
  const [state, setState] = useState<IdentifyState>(startOver)
  const result = useMemo(() => resolve(models, questions, state), [state])

  const onAnswer = (attribute: AttributeId) => (value: AttributeValue) =>
    setState((current) => answer(current, attribute, value))

  return (
    <main className="app">
      <header className="app-header">
        <h1>iPhone Identifier</h1>
      </header>

      {result.status === 'asking' && result.question && (
        <QuestionScreen
          // Remount on each question so a long options list is never left
          // scrolled to where the previous one ended.
          key={result.question.id}
          question={result.question}
          candidates={result.candidates}
          all={models}
          onAnswer={onAnswer(result.question.id)}
          onSkip={() => {
            const attribute = result.question?.id
            if (attribute) setState((current) => skip(current, attribute))
          }}
        />
      )}

      {(result.status === 'narrow-further' || result.status === 'ambiguous') && (
        <GroupScreen
          status={result.status}
          candidates={result.candidates}
          revisitable={result.revisitable}
          all={models}
          onNarrowFurther={() => setState(narrowFurther)}
          onRevisit={(attribute) => setState((current) => unskip(current, attribute))}
        />
      )}

      {result.status === 'resolved' && result.candidates[0] && (
        <ResultScreen model={result.candidates[0]} />
      )}

      {result.status === 'contradictory' && <ContradictionScreen steps={state.steps} />}

      <AnswerTrail questions={questions} steps={state.steps} />

      <nav className="controls" aria-label="Flow controls">
        <button
          type="button"
          className="secondary"
          onClick={() => setState(back)}
          disabled={!canGoBack(state)}
        >
          Back
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setState(startOver)}
          disabled={state.steps.length === 0 && state.tier === 'coarse'}
        >
          Start over
        </button>
      </nav>
    </main>
  )
}
