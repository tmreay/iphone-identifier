/**
 * No candidate is consistent with the answers given.
 *
 * Not a state SPEC.md §4 describes, because on truthful answers it cannot
 * happen: §5.4's matching rule only ever eliminates on a recorded value that
 * disagrees. Reaching it means an answer does not describe the phone — most
 * often colour, on a phone wearing someone else's back glass (§6.4) — so the
 * screen says which answers could have done it rather than blaming the phone.
 *
 * **Currently unreachable by tapping.** `visibleOptions` only ever offers values
 * some candidate records, and answering such a value keeps that candidate, so
 * the set cannot empty. This screen is the floor under that guarantee rather
 * than a screen the flow visits: the engine models the status (`contradictory`),
 * and a UI that could reach it and had nothing to show would be worse than one
 * carrying a screen it does not need. If a future change offers an option no
 * candidate holds, this is what the technician sees instead of a blank page.
 */
import type { Step } from '../engine/types.ts'
import { attributeLabel, listPhrase } from './presenters.ts'

export function ContradictionScreen({ steps }: { steps: Step[] }) {
  const answered = steps.filter((step) => step.value !== null)
  const last = answered[answered.length - 1]

  return (
    <section className="screen">
      <p className="count">No match</p>
      <h2 className="prompt">No model matches every answer</h2>
      <p className="statement">
        Nothing in the 37 fits this combination, so one answer does not describe the
        phone in hand.
        {last && (
          <>
            {' '}
            The last one — {attributeLabel(last.attribute)} — is the place to start;{' '}
            <em>Back</em> undoes it.
          </>
        )}
      </p>
      <p className="help">
        Colour is the usual culprit: a rehoused phone often wears a back glass in a
        colour that model never shipped in. If the back may have been replaced, go back
        and skip it.
      </p>
      {answered.length > 1 && (
        <p className="help">
          Answers given:{' '}
          {listPhrase(answered.map((step) => attributeLabel(step.attribute)))}.
        </p>
      )}
    </section>
  )
}
