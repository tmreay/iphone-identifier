/**
 * The question screen — SPEC.md §4.1, §4.2, §4.3, §8.
 *
 * One question, its options, and "Can't tell" on every one of them (D-09).
 *
 * The options carry **drawings, never photographs** (§8, D-27). A schematic
 * exaggerates the one detail the question turns on and stays legible at 120 px;
 * a product shot does neither, and a wall of real phones beside a question
 * invites matching the bench against pictures instead of answering what was
 * asked (§1). Photographs appear once the app has stopped asking.
 *
 * Options carry a diagram where a picture is what the technician actually needs
 * (§8). Within a question it is all or nothing — `questions.ts` guarantees it
 * and a test enforces it — so the row either has pictures throughout or is the
 * plain text list Phase 3 shipped, and never a ragged mixture of the two.
 */
import { Diagram } from '../diagrams/index.tsx'
import type { AttributeValue, IPhoneModel, ModelId, Question } from '../data/types.ts'
import { CandidateStrip } from './CandidateStrip.tsx'
import { visibleOptions } from './presenters.ts'

export function QuestionScreen({
  question,
  candidates,
  all,
  stripExpanded,
  onToggleStrip,
  onOpenEntry,
  onAnswer,
  onSkip,
}: {
  question: Question
  candidates: IPhoneModel[]
  /** Every model in the matrix, for the strip to dim against. */
  all: IPhoneModel[]
  stripExpanded: boolean
  onToggleStrip: () => void
  onOpenEntry: (id: ModelId) => void
  onAnswer: (value: AttributeValue) => void
  onSkip: () => void
}) {
  const options = visibleOptions(question, candidates)

  return (
    <section className="screen">
      <CandidateStrip
        all={all}
        candidates={candidates}
        expanded={stripExpanded}
        onToggle={onToggleStrip}
        onOpen={onOpenEntry}
      />
      <h2 className="prompt">{question.prompt}</h2>
      {question.help && <p className="help">{question.help}</p>}

      <ul className="options">
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              className={option.diagram ? 'option option-with-diagram' : 'option'}
              onClick={() => onAnswer(option.value)}
            >
              <Diagram id={option.diagram} />
              <span className="option-text">
                <span className="option-label">{option.label}</span>
                {option.caveat && (
                  <span className="option-caveat">{option.caveat}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="skip" onClick={onSkip}>
        Can&rsquo;t tell / not visible
      </button>
    </section>
  )
}
