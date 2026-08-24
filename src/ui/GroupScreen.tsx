/**
 * The group screen — SPEC.md §4.3, §4.4, and the §4.2 revisit offer.
 *
 * Reached with more than one candidate and nothing left to ask on this tier.
 * Two shapes, one screen: the deep tier can still split the group (offer
 * _Narrow further_), or nothing can (say so plainly, §4.4). Both may also be
 * standing on a question the technician skipped, which is the third thing this
 * screen can offer.
 */
import type { AttributeId, IPhoneModel } from '../data/types.ts'
import type { IdentifyStatus } from '../engine/types.ts'
import { CandidateStrip } from './CandidateStrip.tsx'
import {
  ambiguityStatement,
  attributeLabel,
  powerOnHint,
  revisitPrompt,
} from './presenters.ts'

export function GroupScreen({
  status,
  candidates,
  revisitable,
  all,
  onNarrowFurther,
  onRevisit,
}: {
  status: IdentifyStatus
  candidates: IPhoneModel[]
  revisitable: AttributeId[]
  /** Every model in the matrix, for the strip to dim against. */
  all: IPhoneModel[]
  onNarrowFurther: () => void
  onRevisit: (attribute: AttributeId) => void
}) {
  const revisit = revisitPrompt(candidates, revisitable, status)
  // Null while a skip could still split the group: the group is stuck, not
  // terminal, and the offer below says so more usefully.
  const terminal =
    status === 'ambiguous' ? ambiguityStatement(candidates, revisitable) : null

  return (
    <section className="screen">
      <CandidateStrip all={all} candidates={candidates} />
      <h2 className="prompt">
        {terminal ? 'As far as this goes' : 'Narrowed to a group'}
      </h2>

      <ul className="candidates">
        {candidates.map((model) => (
          <li key={model.id} className="candidate">
            {model.name}
          </li>
        ))}
      </ul>

      {terminal && (
        <>
          <p className="statement">{terminal}</p>
          <p className="hint">{powerOnHint}</p>
        </>
      )}

      {revisit && (
        <div className="revisit">
          <p>{revisit}</p>
          <ul className="revisit-actions">
            {revisitable.map((attribute) => (
              <li key={attribute}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onRevisit(attribute)}
                >
                  Answer {attributeLabel(attribute)} after all
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'narrow-further' && (
        <>
          <button type="button" className="primary" onClick={onNarrowFurther}>
            Narrow further
          </button>
          <p className="help">
            The remaining questions need close inspection — micro-details like the rear
            wordmark, camera bump proportions and bottom hole patterns.
          </p>
        </>
      )}
    </section>
  )
}
