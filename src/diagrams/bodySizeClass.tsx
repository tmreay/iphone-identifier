/**
 * `body_size_class` — five silhouettes, SPEC.md §6.3.
 *
 * This is the one question whose diagrams have to be right *relative to each
 * other*: the technician holds the phone against them, and §6.3 warns that
 * neighbouring classes overlap by a few millimetres. So the heights are not
 * invented. Each is a real body height in millimetres, scaled by one constant:
 *
 * | Class      | Height | Taken from                                    |
 * | ---------- | ------ | --------------------------------------------- |
 * | `mini`     | 131.5  | iPhone 12 mini / 13 mini                      |
 * | `compact`  | 138.4  | iPhone 8, SE (2nd/3rd gen)                    |
 * | `standard` | 146.7  | iPhone 12, 13, 14                             |
 * | `large`    | 152.0  | midpoint of the §6.3 band — see below         |
 * | `max`      | 160.8  | iPhone 12 Pro Max, 13 Pro Max, 14 Plus        |
 *
 * `large` is the one figure not read off a handset, because no model in the
 * matrix is `large` alone — §6.3 gives all eight of them `standard` *and*
 * `large`. Its band is 150–156 mm, so the midpoint is what the class means.
 *
 * Widths follow from the heights: every body in the matrix sits within a
 * percent or so of 2.05 : 1, so one ratio serves all five and the silhouettes
 * stay honest without claiming a precision the question does not want.
 *
 * Behind each, the `max` outline is ghosted in. §8 asks for relative scale
 * within a question, and options can be filtered out before the screen renders
 * (`visibleOptions`) — the ghost means a lone silhouette still says how big it
 * is, rather than filling its box like all the others.
 */
import { DiagramSvg, SILHOUETTE_VIEW_BOX } from './primitives.tsx'

/** Millimetres per viewBox unit, chosen so the largest body just fits the square. */
const SCALE = 94 / 160.8
/** Height : width, the ratio every body in the matrix sits within ~1% of. */
const ASPECT = 2.05

function Silhouette({ heightMm }: { heightMm: number }) {
  const height = heightMm * SCALE
  const width = height / ASPECT
  const maxHeight = 160.8 * SCALE
  const maxWidth = maxHeight / ASPECT

  return (
    <DiagramSvg viewBox={SILHOUETTE_VIEW_BOX}>
      <rect
        x={(100 - maxWidth) / 2}
        y={(100 - maxHeight) / 2}
        width={maxWidth}
        height={maxHeight}
        rx={maxWidth * 0.16}
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

export function BodySizeClassMini() {
  return <Silhouette heightMm={131.5} />
}

export function BodySizeClassCompact() {
  return <Silhouette heightMm={138.4} />
}

export function BodySizeClassStandard() {
  return <Silhouette heightMm={146.7} />
}

export function BodySizeClassLarge() {
  return <Silhouette heightMm={152} />
}

export function BodySizeClassMax() {
  return <Silhouette heightMm={160.8} />
}
