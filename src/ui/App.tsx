/**
 * The app — SPEC.md §4.1 to §4.6.
 *
 * Two things live here, and they are deliberately separate.
 *
 * **The identify flow** is one piece of React state: the `IdentifyState` the
 * engine defines. Every screen is a pure function of it, because `resolve()`
 * already derives everything a screen needs — status, candidates, the question
 * to ask, the skips worth revisiting. Nothing about the flow is decided here;
 * this component routes on the status and hands the engine's own actions to the
 * buttons.
 *
 * **Which view is showing** is the URL hash (`route.ts`, D-25), which is not
 * flow state and is not stored with it. That separation is what makes the §4.5
 * link work: looking a model up mid-run and coming back leaves the run where it
 * was, because navigating never touched it.
 */
import { useMemo, useState } from 'react'
import { models } from '../data/models.ts'
import { questions } from '../data/questions.ts'
import type { AttributeId, AttributeValue, ModelId } from '../data/types.ts'
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
import { ModelEntryScreen } from './ModelEntryScreen.tsx'
import { ModelListScreen } from './ModelListScreen.tsx'
import { QuestionScreen } from './QuestionScreen.tsx'
import { ResultScreen } from './ResultScreen.tsx'
import { modelById } from './lookup.ts'
import { candidateCount, entryBackLabel } from './presenters.ts'
import { identifyRoute, useRoute } from './route.ts'

export function App() {
  const [state, setState] = useState<IdentifyState>(startOver)
  const result = useMemo(() => resolve(models, questions, state), [state])
  const [route, navigate] = useRoute()
  /*
    Whether the candidate strip is open. It lives here rather than in the strip
    because the question screen remounts on every question (`key`), and a
    technician who opened the list means to keep it open across answers —
    watching it dim is the reason to have opened it. Closed to begin with:
    §4.1's count is what most runs want, and the list is a drawer (D-31).
  */
  const [stripExpanded, setStripExpanded] = useState(false)
  const toggleStrip = () => setStripExpanded((open) => !open)
  /*
    Opening an entry from inside a run. The run is untouched by navigating
    (D-25), so `from: 'identify'` is what lets the entry offer the way back to
    it rather than to the model list.
  */
  const openFromRun = (id: ModelId) => navigate({ view: 'model', id, from: 'identify' })

  const onAnswer = (attribute: AttributeId) => (value: AttributeValue) =>
    setState((current) => answer(current, attribute, value))

  // The question and group screens are the ones that narrow; the result and
  // contradiction screens say their own thing and a count under them is noise.
  const counted =
    result.status === 'asking' ||
    result.status === 'narrow-further' ||
    result.status === 'ambiguous'

  // A hash naming a model the matrix does not have — an old bookmark, a typo —
  // lands on the list rather than on an error. The list is where someone
  // looking for a model was going anyway.
  const opened = route.view === 'model' ? modelById(models, route.id) : undefined
  /*
    Only when an entry is actually open. A hash naming a model the matrix does
    not have falls back to the list below, and a list that offered "browse all
    37 models" as its way out — because the hash said the entry came from a run
    — would be a dead end with no way back to identifying at all.
  */
  const fromRun =
    opened !== undefined && route.view === 'model' && route.from === 'identify'

  if (route.view === 'models' || route.view === 'model') {
    return (
      <main className="app">
        <header className="app-header">
          <h1>iPhone Identifier</h1>
        </header>

        {opened ? (
          <ModelEntryScreen
            // Remount per model so a long entry never opens scrolled to where
            // the previous one was left.
            key={opened.id}
            model={opened}
            questions={questions}
            backLabel={entryBackLabel(fromRun ? 'identify' : 'list')}
            onBack={() =>
              fromRun ? navigate(identifyRoute) : navigate({ view: 'models' })
            }
          />
        ) : (
          <ModelListScreen
            models={models}
            onOpen={(id) => navigate({ view: 'model', id, from: 'list' })}
          />
        )}

        {/*
          The other destination. An entry opened mid-run offers the run above,
          so this offers the list; anywhere else, this is the way back to
          identifying. Both are always one tap away, and neither disturbs the
          run.
        */}
        <nav className="controls controls-single" aria-label="Flow controls">
          {fromRun ? (
            <button
              type="button"
              className="secondary"
              onClick={() => navigate({ view: 'models' })}
            >
              Browse all {models.length} models
            </button>
          ) : (
            <button
              type="button"
              className="secondary"
              onClick={() => navigate(identifyRoute)}
            >
              Back to identifying
            </button>
          )}
        </nav>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>iPhone Identifier</h1>
      </header>

      {/*
        The strip's spoken half, mounted once for the whole run rather than
        inside the screens. The question screen remounts on every question, and
        a live region inserted with its text already in place is not announced —
        it has to outlive the change for a screen reader to report it. So it
        sits here, where nothing about answering unmounts it, and carries the
        sentence §4.1 step 3 asks for while the chips carry the picture.

        Empty on the screens that have no count to give; emptying a live region
        announces nothing.
      */}
      <p className="visually-hidden" aria-live="polite">
        {counted ? candidateCount(result.candidates.length, models.length) : ''}
      </p>

      {result.status === 'asking' && result.question && (
        <QuestionScreen
          // Remount on each question so a long options list is never left
          // scrolled to where the previous one ended.
          key={result.question.id}
          question={result.question}
          candidates={result.candidates}
          all={models}
          stripExpanded={stripExpanded}
          onToggleStrip={toggleStrip}
          onOpenEntry={openFromRun}
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
          stripExpanded={stripExpanded}
          onToggleStrip={toggleStrip}
          onOpenEntry={openFromRun}
          onNarrowFurther={() => setState(narrowFurther)}
          onRevisit={(attribute) => setState((current) => unskip(current, attribute))}
        />
      )}

      {result.status === 'resolved' && result.candidates[0] && (
        <ResultScreen model={result.candidates[0]} onOpenEntry={openFromRun} />
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

      {/*
        Reverse lookup is reachable from anywhere in the flow, not only from the
        result (§4.6): its other two jobs — training, and reviewing the data —
        are not things a technician arrives at by identifying a phone first.
      */}
      <p className="lookup-entry">
        <button
          type="button"
          className="link"
          onClick={() => navigate({ view: 'models' })}
        >
          Browse all {models.length} models
        </button>
      </p>
    </main>
  )
}
