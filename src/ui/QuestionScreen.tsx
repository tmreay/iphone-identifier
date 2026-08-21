/**
 * The question screen — SPEC.md §4.1, §4.2.
 *
 * One question, its options, and "Can't tell" on every one of them (D-09).
 */
import type { AttributeValue, IPhoneModel, Question } from '../data/types.ts'
import { candidateCount, visibleOptions } from './presenters.ts'

export function QuestionScreen({
  question,
  candidates,
  total,
  onAnswer,
  onSkip,
}: {
  question: Question
  candidates: IPhoneModel[]
  total: number
  onAnswer: (value: AttributeValue) => void
  onSkip: () => void
}) {
  const options = visibleOptions(question, candidates)

  return (
    <section className="screen">
      <p className="count" aria-live="polite">
        {candidateCount(candidates.length, total)}
      </p>
      <h2 className="prompt">{question.prompt}</h2>
      {question.help && <p className="help">{question.help}</p>}

      <ul className="options">
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              className="option"
              onClick={() => onAnswer(option.value)}
            >
              {/* Phase 4 slots the diagram for `option.diagram` in here (§8). */}
              <span className="option-label">{option.label}</span>
              {option.caveat && <span className="option-caveat">{option.caveat}</span>}
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
