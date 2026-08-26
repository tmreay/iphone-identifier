/**
 * A model's product photograph — SPEC.md §4.5, and the picture half of §12.
 *
 * Shown where the app has stopped asking and is showing what it concluded: the
 * result screen, and a group small enough to compare side by side. Never beside
 * a question, where a photograph would invite matching the phone against a
 * picture instead of answering what was asked (§1, D-28).
 *
 * Renders nothing when the set has no shot for this model, which is a real case
 * rather than a defect (`photos.ts`) — the screens around it name the model in
 * text regardless, so an absent photograph costs a picture and never the
 * answer.
 */
import type { IPhoneModel } from '../data/types.ts'
import { photoAlt, photoFor } from './photos.ts'

export function ModelPhoto({ model }: { model: IPhoneModel }) {
  const source = photoFor(model.id)
  if (!source) return null
  return <img className="photo" src={source} alt={photoAlt(model)} loading="lazy" />
}
