/**
 * `camera_bump_size` — the pair of outlines the question cannot be asked
 * without, SPEC.md §6.2 and §12.
 *
 * The help text is unusually specific about what it needs: "answer it only with
 * the two outlines drawn side by side at the same body width". Both halves of
 * that are load-bearing, and both are honoured here. Side by side comes free —
 * the two options render as one list at one scale. Same body width is why both
 * drawings use the shared `BodyCrop` untouched: if the bodies differed the
 * comparison would be measuring the drawing, not the phone.
 *
 * An earlier draft ghosted the other option in behind each housing. It was
 * dropped: at this size the ghost's outline crossed the very lenses whose size
 * the technician is being asked to judge, and made the comparison harder rather
 * than easier. Two clean outlines in one list is what the help text asked for.
 *
 * **The ratio is schematic, not measured.** §8 permits a diagram to exaggerate
 * the detail that matters, and this one does. The two committed product shots —
 * `iphone-13.jpg` and `iphone-14.jpg` — are taken at different angles, so a
 * housing-to-body ratio measured across them would be measuring the
 * photographers' perspective as much as the phones. The drawing states the
 * direction of the difference, which is all the question asks for: it is a
 * comparison, not a measurement.
 */
import { BodyCrop, DiagramSvg, Housing, Lens, REAR_VIEW_BOX } from './primitives.tsx'

const LARGER = { x: 17, y: 12, size: 46, lens: 9.5 }
const SMALLER = { x: 21, y: 16, size: 36, lens: 7.5 }

function DiagonalDual({ spec }: { spec: typeof LARGER }) {
  const { x, y, size, lens } = spec
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={x} y={y} width={size} height={size} radius={size * 0.31} accent />
      <Lens cx={x + size * 0.29} cy={y + size * 0.29} r={lens} accent />
      <Lens cx={x + size * 0.7} cy={y + size * 0.7} r={lens} accent />
    </DiagramSvg>
  )
}

/** iPhone 14, 14 Plus, 15, 15 Plus. */
export function CameraBumpSizeLarger() {
  return <DiagonalDual spec={LARGER} />
}

/** iPhone 13, 13 mini. */
export function CameraBumpSizeSmaller() {
  return <DiagonalDual spec={SMALLER} />
}
