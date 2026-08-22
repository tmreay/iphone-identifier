/**
 * `rear_wordmark` — where the logo sits and whether the word is under it,
 * SPEC.md §6.2.
 *
 * The whole back, not a crop: the question is entirely about position down the
 * length of the body, which a crop of the top would throw away.
 *
 * The logo is drawn as a plain roundel rather than as Apple's mark. §8 chose
 * hand-drawn SVG partly to keep the app clear of other people's artwork, and
 * redrawing the logo would walk straight back into it. Nothing is lost: the
 * question asks *where* the mark is and whether a word sits below it, and a
 * technician looking at the back already knows what the mark looks like.
 */
import type { ReactNode } from 'react'

import { DiagramSvg, WHOLE_BODY_VIEW_BOX } from './primitives.tsx'

const WIDTH = 44
const HEIGHT = 90
const LEFT = (56 - WIDTH) / 2
const TOP = (100 - HEIGHT) / 2

function Back({ children }: { children: ReactNode }) {
  return (
    <DiagramSvg viewBox={WHOLE_BODY_VIEW_BOX}>
      <rect
        x={LEFT}
        y={TOP}
        width={WIDTH}
        height={HEIGHT}
        rx={7}
        className="dg-line"
        fill="none"
        strokeWidth={2}
      />
      {children}
    </DiagramSvg>
  )
}

/** iPhone 8 through XS Max: mark in the upper third, the word below it. */
export function RearWordmarkIphoneTextPresent() {
  return (
    <Back>
      <circle cx={28} cy={32} r={6.5} className="dg-accent-fill" />
      <text
        x={28}
        y={78}
        textAnchor="middle"
        className="dg-accent-fill dg-word"
        fontSize={9}
      >
        iPhone
      </text>
    </Back>
  )
}

/** iPhone 11 on: the mark alone, centred, and no word anywhere on the back. */
export function RearWordmarkLogoOnlyCentred() {
  return (
    <Back>
      <circle cx={28} cy={50} r={6.5} className="dg-accent-fill" />
    </Back>
  )
}
