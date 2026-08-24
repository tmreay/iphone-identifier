/**
 * `front_cutout` — what is at the top of the screen, SPEC.md §6.1.
 *
 * The accent is the cutout itself, and the earpiece slot is drawn on all four
 * because it is what separates the two notches: on a wide notch the slot sits
 * *inside* the notch, on a narrow one it has moved up into the bezel above.
 * That is the difference the help text asks the technician to look for, so a
 * drawing without it would be showing them the wrong thing.
 */
import {
  BODY_LEFT,
  BODY_RIGHT,
  BODY_TOP,
  DiagramSvg,
  REAR_VIEW_BOX,
} from './primitives.tsx'

const SCREEN_LEFT = 18
const SCREEN_RIGHT = 82
const SCREEN_TOP = 12

/** The body, cropped like the rear diagrams so front and back read at one scale. */
function FrontBody() {
  return (
    <path
      d={`M ${BODY_LEFT} 70 L ${BODY_LEFT} 20 Q ${BODY_LEFT} ${BODY_TOP} 26 ${BODY_TOP} L 74 ${BODY_TOP} Q ${BODY_RIGHT} ${BODY_TOP} ${BODY_RIGHT} 20 L ${BODY_RIGHT} 70`}
      className="dg-line"
      fill="none"
      strokeWidth={2}
    />
  )
}

/** The glass, following the body's curve — the edge-to-edge screen of every model from the X on. */
function EdgeToEdgeScreen() {
  return (
    <path
      d={`M ${SCREEN_LEFT} 70 L ${SCREEN_LEFT} 22 Q ${SCREEN_LEFT} ${SCREEN_TOP} 28 ${SCREEN_TOP} L 72 ${SCREEN_TOP} Q ${SCREEN_RIGHT} ${SCREEN_TOP} ${SCREEN_RIGHT} 22 L ${SCREEN_RIGHT} 70`}
      className="dg-line"
      fill="none"
      strokeWidth={1.4}
    />
  )
}

function EarpieceSlot({
  y,
  width,
  accent,
}: {
  y: number
  width: number
  accent?: boolean
}) {
  return (
    <rect
      x={50 - width / 2}
      y={y}
      width={width}
      height={2.6}
      rx={1.3}
      className={accent ? 'dg-accent-fill' : 'dg-line-fill'}
    />
  )
}

/**
 * A notch: hangs from the top of the glass, square where it meets the edge and
 * rounded where it comes away from it.
 */
function Notch({ width, depth }: { width: number; depth: number }) {
  const x1 = 50 - width / 2
  const x2 = 50 + width / 2
  const bottom = SCREEN_TOP + depth
  const r = 5
  return (
    <path
      d={`M ${x1} ${SCREEN_TOP} L ${x1} ${bottom - r} Q ${x1} ${bottom} ${x1 + r} ${bottom} L ${x2 - r} ${bottom} Q ${x2} ${bottom} ${x2} ${bottom - r} L ${x2} ${SCREEN_TOP} Z`}
      className="dg-accent"
      fill="none"
      strokeWidth={2}
    />
  )
}

/** iPhone 8, SE: a plain rectangular screen with a solid band above it. */
export function FrontCutoutBezelsNoCutout() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <FrontBody />
      <path
        d={`M ${SCREEN_LEFT} 70 L ${SCREEN_LEFT} 34 L ${SCREEN_RIGHT} 34 L ${SCREEN_RIGHT} 70`}
        className="dg-accent"
        fill="none"
        strokeWidth={2}
      />
      <EarpieceSlot y={20} width={20} accent />
    </DiagramSvg>
  )
}

/** iPhone X through 12: a wide notch with the earpiece slot inside it. */
export function FrontCutoutNotchWide() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <FrontBody />
      <EdgeToEdgeScreen />
      <Notch width={38} depth={14} />
      <EarpieceSlot y={21} width={14} accent />
    </DiagramSvg>
  )
}

/** iPhone 13, 14, 16e, 17e: a shorter notch, the earpiece moved up into the bezel above. */
export function FrontCutoutNotchNarrow() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <FrontBody />
      <EdgeToEdgeScreen />
      <Notch width={28} depth={12} />
      <EarpieceSlot y={8.7} width={14} accent />
    </DiagramSvg>
  )
}

/** iPhone 14 Pro on: a free-floating pill with glass all around it. */
export function FrontCutoutDynamicIsland() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <FrontBody />
      <EdgeToEdgeScreen />
      <rect
        x={35}
        y={19}
        width={30}
        height={10}
        rx={5}
        className="dg-accent"
        fill="none"
        strokeWidth={2}
      />
    </DiagramSvg>
  )
}
