/**
 * The group screen — SPEC.md §4.3, §4.4, and the §4.2 revisit offer.
 *
 * Reached with more than one candidate and nothing left to ask on this tier.
 * Two shapes, one screen: the deep tier can still split the group (offer
 * _Narrow further_), or nothing can (say so plainly, §4.4). Both may also be
 * standing on a question the technician skipped, which is the third thing this
 * screen can offer.
 *
 * A group small enough to compare — four or fewer — is listed as product
 * photographs rather than as names (D-27). This is the screen where a picture
 * earns its place: the app has run out of questions, and what is left is a
 * technician holding a phone against a shortlist. Each card opens that model's
 * entry (§4.6), because the next thing after "it is one of these two" is
 * reading what the matrix records for each.
 */
import type { AttributeId, IPhoneModel, ModelId } from '../data/types.ts'
import type { IdentifyStatus } from '../engine/types.ts'
import { CandidateStrip } from './CandidateStrip.tsx'
import { ModelPhoto } from './ModelPhoto.tsx'
import { showsPhotos } from './photos.ts'
import {
  ambiguityStatement,
  attributeLabel,
  identicalPhotoNote,
  powerOnHint,
  revisitPrompt,
} from './presenters.ts'

export function GroupScreen({
  status,
  candidates,
  revisitable,
  all,
  stripExpanded,
  onToggleStrip,
  onOpenEntry,
  onNarrowFurther,
  onRevisit,
}: {
  status: IdentifyStatus
  candidates: IPhoneModel[]
  revisitable: AttributeId[]
  /** Every model in the matrix, for the strip to dim against. */
  all: IPhoneModel[]
  stripExpanded: boolean
  onToggleStrip: () => void
  onOpenEntry: (id: ModelId) => void
  onNarrowFurther: () => void
  onRevisit: (attribute: AttributeId) => void
}) {
  const revisit = revisitPrompt(candidates, revisitable, status)
  // Null while a skip could still split the group: the group is stuck, not
  // terminal, and the offer below says so more usefully.
  const terminal =
    status === 'ambiguous' ? ambiguityStatement(candidates, revisitable) : null
  const photos = showsPhotos(candidates.length)

  return (
    <section className="screen">
      <CandidateStrip
        all={all}
        candidates={candidates}
        expanded={stripExpanded}
        onToggle={onToggleStrip}
        onOpen={onOpenEntry}
      />
      <h2 className="prompt">
        {terminal ? 'As far as this goes' : 'Narrowed to a group'}
      </h2>

      <ul className={photos ? 'candidates candidates-photos' : 'candidates'}>
        {candidates.map((model) => (
          <li key={model.id}>
            <button
              type="button"
              className="candidate"
              onClick={() => onOpenEntry(model.id)}
            >
              {/* The card names the model below, so the picture is decorative here. */}
              {photos && <ModelPhoto model={model} alt="" />}
              <span className="candidate-name">{model.name}</span>
            </button>
          </li>
        ))}
      </ul>

      {terminal && (
        <>
          <p className="statement">{terminal}</p>
          {/*
            After the statement, never before it: the note explains what the
            pictures above can and cannot do, and that only means anything once
            the screen has said the group is terminal.
          */}
          {photos && <p className="hint">{identicalPhotoNote}</p>}
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
