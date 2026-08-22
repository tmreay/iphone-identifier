/**
 * The diagram slot on an answer option — SPEC.md §8.
 *
 * Renders nothing for an unknown id. That is deliberate: an option without a
 * picture is the state Phase 3 shipped in and the screen already handles it.
 * Nothing should reach that path, and the registry test is what keeps it true.
 */
import { diagrams } from './registry.ts'

export function Diagram({ id }: { id: string | undefined }) {
  const Drawing = id === undefined ? undefined : diagrams[id]
  if (!Drawing) return null
  return (
    <span className="diagram">
      <Drawing />
    </span>
  )
}
