/**
 * The question screen — SPEC.md §4.1, §4.2, §4.3, §8.
 *
 * One question, its options, and "Can't tell" on every one of them (D-09).
 *
 * Options carry a diagram where a picture is what the technician actually needs
 * (§8). Within a question it is all or nothing — `questions.ts` guarantees it
 * and a test enforces it — so the row either has pictures throughout or is the
 * plain text list Phase 3 shipped, and never a ragged mixture of the two.
 */
import { Diagram } from '../diagrams/index.tsx'
import type { AttributeValue, IPhoneModel, Question } from '../data/types.ts'
import { CandidateStrip } from './CandidateStrip.tsx'
import { visibleOptions } from './presenters.ts'

export function QuestionScreen({
  question,
  candidates,
  all,
  onAnswer,
  onSkip,
}: {
  question: Question
  candidates: IPhoneModel[]
  /** Every model in the matrix, for the strip to dim against. */
  all: IPhoneModel[]
  onAnswer: (value: AttributeValue) => void
  onSkip: () => void
}) {
  const options = visibleOptions(question, candidates)

  return (
    <section className="screen">
      <CandidateStrip all={all} candidates={candidates} />
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
