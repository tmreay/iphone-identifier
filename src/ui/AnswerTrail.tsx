/**
 * The answer trail — SPEC.md §4.1, §4.5.
 *
 * "The answer trail is visible so a wrong answer can be spotted and corrected."
 * Spotting is this component's job; correcting is _Back_'s. It is deliberately
 * not a set of rewind links: `back()` undoes one step, and a trail entry that
 * silently discarded the four answers below it would lose work the technician
 * did not offer up.
 */
import type { Question } from '../data/types.ts'
import type { Step } from '../engine/types.ts'
import { trailEntries } from './presenters.ts'

export function AnswerTrail({
  questions,
  steps,
}: {
  questions: Question[]
  steps: Step[]
}) {
  if (steps.length === 0) return null
  const entries = trailEntries(questions, steps)

  return (
    <section className="trail" aria-label="Your answers">
      <h3 className="trail-heading">Your answers</h3>
      <ol className="trail-list">
        {entries.map((entry, index) => (
          <li key={`${entry.attribute}-${index}`} className="trail-item">
            <span className="trail-label">{entry.label}</span>
            {entry.answer === null ? (
              <span className="trail-answer trail-skipped">Couldn&rsquo;t tell</span>
            ) : (
              <span className="trail-answer">{entry.answer}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
