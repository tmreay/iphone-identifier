/**
 * The reverse-lookup list — SPEC.md §4.6.
 *
 * All 37 models, grouped by release year. No search box and no filter: the
 * whole set is three screens on a phone, and a field to type into is the wrong
 * affordance for a bench where the technician's other hand is holding a phone.
 *
 * No pictures of models, deliberately. §12 records the reasoning at length; the
 * short version is that the reference shots are Apple's and are kept out of the
 * build (D-13), and that a wall of model photos invites matching against
 * pictures instead of looking at the phone — the failure mode §1 opens with.
 */
import type { IPhoneModel, ModelId } from '../data/types.ts'
import { modelsByYear } from './lookup.ts'

export function ModelListScreen({
  models,
  onOpen,
}: {
  models: IPhoneModel[]
  onOpen: (id: ModelId) => void
}) {
  const groups = modelsByYear(models)

  return (
    <section className="screen">
      <p className="count">Reverse lookup</p>
      <h2 className="prompt">All {models.length} models</h2>
      <p className="help">
        Every characteristic the matrix records, model by model — to check a phone
        against, or to learn the set.
      </p>

      {groups.map((group) => (
        <div key={group.year} className="model-group">
          <h3 className="model-group-year">{group.year}</h3>
          <ul className="model-list">
            {group.models.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  className="model-link"
                  onClick={() => onOpen(model.id)}
                >
                  {model.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
