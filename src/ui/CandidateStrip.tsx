/**
 * The candidate strip — SPEC.md §4.1 step 3, and the narrowing half of the §12
 * open question.
 *
 * Every model in the matrix, in release order, dimming as answers eliminate it.
 * It replaces the "12 of 37 models match" line the earlier screens carried: the
 * sentence made a technician hold the narrowing in their head, and the strip
 * shows it — which era went out, whether the Pros are gone, how close the run
 * is to done — in a glance that costs nothing at the bench.
 *
 * **A readout, not a lookup surface.** §12 names the failure mode: a wall of
 * model names invites matching the phone against the wall instead of answering
 * the question in front of you. So the chips are small, unlabelled by anything
 * but a name, and — the load-bearing part — not buttons. Nothing here is
 * clickable, and the strip never claims which of the survivors it is.
 *
 * **Accessibility.** Thirty-seven names re-read on every answer is noise, not
 * information, so the chips are `aria-hidden` and the count §4.1 asks for is
 * spoken instead, once, in words. That live region lives in `App.tsx` rather
 * than here: this component sits inside a screen that remounts on every
 * question, and a region inserted with its text already in place is not
 * announced — it has to outlive the change for a screen reader to report it.
 */
import type { IPhoneModel } from '../data/types.ts'
import { candidateStrip } from './presenters.ts'

export function CandidateStrip({
  all,
  candidates,
}: {
  all: IPhoneModel[]
  candidates: IPhoneModel[]
}) {
  const entries = candidateStrip(all, candidates)

  return (
    <div className="strip">
      <ul className="strip-models" aria-hidden="true">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.remaining ? 'strip-model' : 'strip-model strip-model-out'}
            title={entry.name}
          >
            {entry.short}
          </li>
        ))}
      </ul>
    </div>
  )
}
