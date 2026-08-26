/**
 * The candidate strip — SPEC.md §4.1 step 3, and the §12 open question it came
 * out of.
 *
 * **Collapsed by default: "12 of 37 candidates", under a chevron.** That line is the live count
 * §4.1 step 3 asks for, and on most screens it is all a technician wants — the
 * run is narrowing, and by how much. Expanding it shows every model in the
 * matrix in release order, dimming the ones that have gone out, which is the
 * half a bare count never showed: *which* twelve, and whether the era or the
 * Pros went with them.
 *
 * **Expanded, the chips are buttons.** Tapping one opens that model's
 * reverse-lookup entry, and coming back leaves the run exactly where it was
 * (`route.ts`, D-25). §12 built the first version as a readout on purpose,
 * because a standing wall of models invites matching the phone against the wall
 * instead of answering the question in front of you — the failure mode §1 opens
 * with. Collapsing is what answers that: the wall is not standing, it is a
 * drawer, and opening it is a thing the technician asked for rather than a
 * thing the screen does at them (D-28).
 *
 * **Accessibility.** The chips are announced normally when expanded — thirty
 * seven names are worth reading to someone who just asked for the list — and
 * are out of the tree when collapsed (`hidden`), which is what stops them being
 * re-read on every answer. The count itself is spoken from a live region in
 * `App.tsx` rather than from here: this component sits inside a screen that
 * remounts on every question, and a region inserted with its text already in
 * place is not announced — it has to outlive the change to be reported.
 */
import type { IPhoneModel, ModelId } from '../data/types.ts'
import { candidateStrip, candidateSummary } from './presenters.ts'

const LIST_ID = 'candidate-strip-models'

export function CandidateStrip({
  all,
  candidates,
  expanded,
  onToggle,
  onOpen,
}: {
  all: IPhoneModel[]
  candidates: IPhoneModel[]
  expanded: boolean
  onToggle: () => void
  /** Opens a model's entry (§4.6). Only the survivors offer it. */
  onOpen: (id: ModelId) => void
}) {
  const entries = candidateStrip(all, candidates)

  return (
    <div className="strip">
      <button
        type="button"
        className="strip-toggle"
        aria-expanded={expanded}
        aria-controls={LIST_ID}
        onClick={onToggle}
      >
        <span className="strip-summary">
          {candidateSummary(candidates.length, all.length)}
        </span>
        {/*
          A chevron, pointing down to open and up to close. Decorative and
          `aria-hidden`: the button's state is carried by `aria-expanded`, which
          a screen reader reads as "collapsed" or "expanded" without needing a
          word on screen to say it twice. That leaves the accessible name as the
          count itself, which is the thing worth hearing.
        */}
        <svg
          className="strip-chevron"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3.5 6 8 10.5 12.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/*
        Always mounted, `hidden` when closed, so `aria-controls` above always
        names an element that exists. `hidden` also takes the chips out of the
        accessibility tree entirely, which is the same thing the old
        conditional achieved and the reason thirty-seven names are not re-read
        on every answer.
      */}
      <ul className="strip-models" id={LIST_ID} hidden={!expanded}>
        {entries.map((entry) =>
          entry.remaining ? (
            <li key={entry.id}>
              {/*
                  Still in the running, so still worth looking up: the entry is
                  where a technician checks a candidate against the phone in
                  hand (§4.6). It never claims this is the model — tapping one
                  opens a description, and the run is untouched by it.
                */}
              <button
                type="button"
                className="strip-model"
                title={entry.name}
                onClick={() => onOpen(entry.id)}
              >
                {entry.short}
                <span className="visually-hidden"> — {entry.name}, open its entry</span>
              </button>
            </li>
          ) : (
            /*
                Eliminated: dimmed, still readable, still in place. Which models
                went out and when is what the count cannot say, and a chip that
                vanished would take the shape of the strip with it. Not a
                button, because an answer already ruled this one out and a tap
                target would suggest otherwise.
              */
            <li
              key={entry.id}
              className="strip-model strip-model-out"
              title={entry.name}
            >
              {entry.short}
              <span className="visually-hidden"> — {entry.name}, ruled out</span>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
