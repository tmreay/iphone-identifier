/**
 * The result screen — SPEC.md §4.5.
 *
 * **Model name only.** No A-numbers, specs or repair notes: they are out of
 * scope (§3.2), and putting them here would make this screen the thing people
 * check rather than the phone in their hand.
 */
import type { IPhoneModel } from '../data/types.ts'

export function ResultScreen({ model }: { model: IPhoneModel }) {
  return (
    <section className="screen">
      <p className="count">Identified</p>
      <h2 className="result-name">{model.name}</h2>
      {/*
        §4.5 asks for a link into this model's reverse-lookup entry, so the
        technician can check the phone against every characteristic recorded for
        it. Reverse lookup is Phase 5; naming the model it will open is the
        honest placeholder, and a dead link would not be.
      */}
      <p className="note">
        The reverse-lookup entry for {model.name} — every characteristic the matrix
        records, to check the phone against — arrives in Phase 5.
      </p>
    </section>
  )
}
