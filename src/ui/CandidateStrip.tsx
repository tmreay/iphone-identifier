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
 * information, so the chips are `aria-hidden` and the live region carries the
 * sentence instead. The count §4.1 asks for is announced, once, in words.
 */
import type { IPhoneModel } from '../data/types.ts'
import { candidateCount, candidateStrip } from './presenters.ts'

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
      <p className="visually-hidden" aria-live="polite">
        {candidateCount(candidates.length, all.length)}
      </p>
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
