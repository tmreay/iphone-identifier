/**
 * The result screen — SPEC.md §4.5.
 *
 * **Model name only.** No A-numbers, specs or repair notes: they are out of
 * scope (§3.2), and putting them here would make this screen the thing people
 * check rather than the phone in their hand.
 *
 * The one thing it does carry is the way into that model's reverse-lookup
 * entry, so the technician can check the phone against every characteristic
 * recorded for it before ordering a part. Opening it does not end the run — the
 * flow state is untouched by navigating (`route.ts`), so Back returns to this
 * screen with the answer trail intact.
 */
import type { IPhoneModel, ModelId } from '../data/types.ts'

export function ResultScreen({
  model,
  onOpenEntry,
}: {
  model: IPhoneModel
  onOpenEntry: (id: ModelId) => void
}) {
  return (
    <section className="screen">
      <p className="count">Identified</p>
      <h2 className="result-name">{model.name}</h2>

      <button type="button" className="primary" onClick={() => onOpenEntry(model.id)}>
        Check against the {model.name} entry
      </button>
      <p className="help">
        Every characteristic the matrix records for it, with the same drawings the
        questions used.
      </p>
    </section>
  )
}
