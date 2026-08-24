/**
 * Shared drawing vocabulary for the answer-option diagrams — SPEC.md §8.
 *
 * Every diagram is one square `viewBox="0 0 100 100"`, so a row of options
 * renders at one scale and the silhouettes are directly comparable (§8). The
 * families compose differently inside that square:
 *
 * - **rear crop** — the top of the back, body edges running off the bottom of
 *   the frame. Used by the camera questions, where the whole body would waste
 *   four fifths of the picture on blank glass.
 * - **front crop** — the same crop of the front, for `front_cutout`.
 * - **whole body** — `body_size_class` and `rear_wordmark`, both of which are
 *   questions about the body as a whole.
 * - **edge strip** — `bottom_mic_hole_pattern`, seen square on to the bottom.
 *
 * Colour is carried by two classes rather than attributes, so the palette lives
 * in `styles.css` with the rest of the theme: `dg-line` is the schematic
 * monochrome, `dg-accent` the single highlight §8 allows. A diagram accents the
 * feature its question asks about and nothing else — which is why the same
 * camera housing is drawn plain under `flash_position` and accented under
 * `rear_camera_layout`.
 *
 * Diagrams are decorative: the option label carries the meaning, so every
 * `<svg>` is `aria-hidden`. A technician using a screen reader loses nothing.
 */
import type { ReactNode } from 'react'

/** The body's left and right edges, shared by every rear and front crop. */
export const BODY_LEFT = 14
export const BODY_RIGHT = 86
export const BODY_TOP = 8

/**
 * Each family gets the viewBox that fits what it draws, and every diagram in a
 * family shares one — which is what makes the options within a question
 * comparable (§8). A single square for all of them was the first attempt and it
 * wasted two thirds of every camera drawing on blank back glass, leaving the
 * detail that matters too small to read at the size a phone renders it.
 */
export const REAR_VIEW_BOX = '0 0 100 70'
export const WHOLE_BODY_VIEW_BOX = '0 0 56 100'
export const SILHOUETTE_VIEW_BOX = '0 0 100 100'
export const EDGE_VIEW_BOX = '0 0 100 28'

export function DiagramSvg({
  viewBox,
  children,
}: {
  viewBox: string
  children: ReactNode
}) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

/**
 * The body outline, cropped: top edge and corners drawn, sides running off the
 * bottom of the frame. Open rather than closed on purpose — a closed rectangle
 * would read as a whole phone at the wrong aspect ratio.
 */
export function BodyCrop({ accent = false }: { accent?: boolean }) {
  return (
    <path
      d={`M ${BODY_LEFT} 70 L ${BODY_LEFT} 20 Q ${BODY_LEFT} ${BODY_TOP} 26 ${BODY_TOP} L 74 ${BODY_TOP} Q ${BODY_RIGHT} ${BODY_TOP} ${BODY_RIGHT} 20 L ${BODY_RIGHT} 70`}
      className={accent ? 'dg-accent' : 'dg-line'}
      fill="none"
      strokeWidth={2}
    />
  )
}

/** A camera lens: outer barrel and the glass inside it. */
export function Lens({
  cx,
  cy,
  r,
  accent = false,
}: {
  cx: number
  cy: number
  r: number
  accent?: boolean
}) {
  const cls = accent ? 'dg-accent' : 'dg-line'
  return (
    <g className={cls} fill="none">
      <circle cx={cx} cy={cy} r={r} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.44} strokeWidth={1.5} />
    </g>
  )
}

/**
 * The flash — the pale oval that glints yellow, as `flash_position` puts it.
 * Filled when it is the subject, so it reads at a glance against the lenses.
 */
export function Flash({
  cx,
  cy,
  r,
  accent = false,
}: {
  cx: number
  cy: number
  r: number
  accent?: boolean
}) {
  if (accent) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} className="dg-accent-fill" />
        <circle
          cx={cx}
          cy={cy}
          r={r + 2.5}
          className="dg-accent"
          fill="none"
          strokeWidth={1.2}
        />
      </g>
    )
  }
  return (
    <circle cx={cx} cy={cy} r={r} className="dg-line" fill="none" strokeWidth={1.8} />
  )
}

/** The small round microphone hole, which every camera question tells the technician to ignore. */
export function Mic({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={1.5} className="dg-line-fill" />
}

/** The LiDAR scanner: a flat black dot, no glass ring — hence no inner circle. */
export function Lidar({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r} className="dg-line-fill" />
}

/** A raised housing — pill, rounded square or plateau, all one rounded rect. */
export function Housing({
  x,
  y,
  width,
  height,
  radius,
  accent = false,
  ghost = false,
}: {
  x: number
  y: number
  width: number
  height: number
  radius: number
  accent?: boolean
  ghost?: boolean
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={radius}
      className={ghost ? 'dg-ghost' : accent ? 'dg-accent' : 'dg-line'}
      fill="none"
      strokeWidth={2}
      strokeDasharray={ghost ? '3 3' : undefined}
    />
  )
}
