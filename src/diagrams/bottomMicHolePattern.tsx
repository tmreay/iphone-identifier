/**
 * `bottom_mic_hole_pattern` — the bottom edge, square on, SPEC.md §6.2 and §9.
 *
 * Drawn from the three iFixit photographs in `reference/images/ifixit/`, the
 * only evidence in the repository for this attribute and the only thing that
 * separates the iPhone X from the XS (§9).
 *
 * The two pentalobe screws either side of the port are drawn, unaccented. They
 * are not holes and the question does not ask about them, but they sit exactly
 * where the counting starts, and a technician counting off a picture that
 * omitted them would count them on the phone. Drawing them plain, with the
 * holes accented, says which is which without a word.
 *
 * `reference/images/ifixit/README.md` records that these counts were taken from
 * 3x enlargements, because at full frame the XS Max's four/seven reads as the
 * XS's three/six. That is the mistake this diagram exists to prevent, so the
 * holes are drawn at a spacing that keeps the last one clear of the corner even
 * at seven a side.
 */
import { DiagramSvg, EDGE_VIEW_BOX } from './primitives.tsx'

const SPACING = 4.3
const FIRST_LEFT = 31.5
const FIRST_RIGHT = 68.5

function holes(count: number, from: number, direction: -1 | 1) {
  return Array.from({ length: count }, (_, index) => from + direction * index * SPACING)
}

function BottomEdge({ left, right }: { left: number; right: number }) {
  return (
    <DiagramSvg viewBox={EDGE_VIEW_BOX}>
      <rect
        x={3}
        y={1}
        width={94}
        height={26}
        rx={11}
        className="dg-line"
        fill="none"
        strokeWidth={2}
      />
      <rect
        x={42.5}
        y={9.5}
        width={15}
        height={9}
        rx={4.5}
        className="dg-line"
        fill="none"
        strokeWidth={1.8}
      />
      <circle
        cx={37}
        cy={14}
        r={2.2}
        className="dg-line"
        fill="none"
        strokeWidth={1.4}
      />
      <circle
        cx={63}
        cy={14}
        r={2.2}
        className="dg-line"
        fill="none"
        strokeWidth={1.4}
      />
      {holes(left, FIRST_LEFT, -1).map((cx) => (
        <circle key={`l${cx}`} cx={cx} cy={14} r={1.2} className="dg-accent-fill" />
      ))}
      {holes(right, FIRST_RIGHT, 1).map((cx) => (
        <circle key={`r${cx}`} cx={cx} cy={14} r={1.2} className="dg-accent-fill" />
      ))}
    </DiagramSvg>
  )
}

/** iPhone X. */
export function BottomMicHolePatternSymmetricSixSix() {
  return <BottomEdge left={6} right={6} />
}

/** iPhone XS. */
export function BottomMicHolePatternAsymmetricThreeSix() {
  return <BottomEdge left={3} right={6} />
}

/** iPhone XS Max. */
export function BottomMicHolePatternAsymmetricFourSeven() {
  return <BottomEdge left={4} right={7} />
}
