/**
 * `body_size_class` — three silhouettes, SPEC.md §6.3.
 *
 * This is the one question whose diagrams have to be right *relative to each
 * other*: the technician holds the phone against them. So the heights are not
 * invented. §6.3 draws each band across a cluster of real bodies, and each
 * silhouette is the **midpoint of its band's extreme members** — one rule for
 * all three, so no class is drawn by a different standard than its neighbours:
 *
 * | Class      | Height | Midpoint of                                     |
 * | ---------- | ------ | ----------------------------------------------- |
 * | `small`    | 135.0  | 131.5 (12/13 mini) … 138.4 (8, SE 2nd/3rd)      |
 * | `standard` | 147.3  | 143.6 (X, XS) … 150.9 (XR, 11)                  |
 * | `large`    | 159.8  | 156.2 (Air) … 163.4 (17 Pro Max)                |
 *
 * Five bands were drawn here until D-27, and one of them — `large`, then meaning
 * ~150–156 mm — had no members to take a height from at all, because no model
 * in the matrix was `large` alone. Its outline was the midpoint of an empty
 * band: a drawing of a phone that does not exist. The three bands each hold real
 * bodies, so every height above is read off the matrix.
 *
 * Widths follow from the heights: every body in the matrix sits within a
 * percent or so of 2.05 : 1, so one ratio serves all three and the silhouettes
 * stay honest without claiming a precision the question does not want.
 *
 * Behind each, the largest body in the matrix is ghosted in. §8 asks for
 * relative scale within a question, and options can be filtered out before the
 * screen renders (`visibleOptions`) — the ghost means a lone silhouette still
 * says how big it is, rather than filling its box like all the others.
 */
import { DiagramSvg, SILHOUETTE_VIEW_BOX } from './primitives.tsx'

/** The tallest body in the matrix (iPhone 17 Pro Max), drawn as the ghost. */
const TALLEST_MM = 163.4
/** Millimetres per viewBox unit, chosen so the largest body just fits the square. */
const SCALE = 94 / TALLEST_MM
/** Height : width, the ratio every body in the matrix sits within ~1% of. */
const ASPECT = 2.05

function Silhouette({ heightMm }: { heightMm: number }) {
  const height = heightMm * SCALE
  const width = height / ASPECT
  const ghostHeight = TALLEST_MM * SCALE
  const ghostWidth = ghostHeight / ASPECT

  return (
    <DiagramSvg viewBox={SILHOUETTE_VIEW_BOX}>
      <rect
        x={(100 - ghostWidth) / 2}
        y={(100 - ghostHeight) / 2}
        width={ghostWidth}
        height={ghostHeight}
        rx={ghostWidth * 0.16}
        className="dg-ghost"
        fill="none"
        strokeWidth={1.8}
        strokeDasharray="4 4"
      />
      <rect
        x={(100 - width) / 2}
        y={(100 - height) / 2}
        width={width}
        height={height}
        rx={width * 0.16}
        className="dg-accent"
        fill="none"
        strokeWidth={2.4}
      />
    </DiagramSvg>
  )
}

export function BodySizeClassSmall() {
  return <Silhouette heightMm={135} />
}

export function BodySizeClassStandard() {
  return <Silhouette heightMm={147.3} />
}

export function BodySizeClassLarge() {
  return <Silhouette heightMm={159.8} />
}
