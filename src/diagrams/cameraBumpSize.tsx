/**
 * `camera_bump_size` — the pair of outlines the question cannot be asked
 * without, SPEC.md §6.2, §9 and §12.
 *
 * The help text is unusually specific about what it needs: "answer it only with
 * the two outlines drawn side by side at the same body width". Both halves are
 * honoured. Side by side comes free — the two options render as one list at one
 * scale. Same body width is why both drawings use the shared `BodyCrop`
 * untouched: if the bodies differed the comparison would be measuring the
 * drawing, not the phone.
 *
 * **These are drawn to measured scale, not to a guess.** Both housings and both
 * lens sizes come from the committed Apple product shots, whose bodies are
 * square on (checked: the back panel's left edge holds the same x to within
 * 4 px down its whole straight run). Body width in pixels is derived from body
 * height and the real millimetre dimensions in `reference/matrix.md`, then
 * confirmed against the panel's own right edge, which lands within 2 px.
 *
 * | Model         | Housing width | Outer lens |
 * | ------------- | ------------- | ---------- |
 * | iPhone 13     | 29.5 mm       | ~13.5 mm   |
 * | iPhone 13 mini| 28.9 mm       | ~13.9 mm   |
 * | iPhone 14     | 30.7 mm       | ~15.8 mm   |
 * | iPhone 14 Plus| 30.7 mm       | ~15.9 mm   |
 * | iPhone 15     | 31.6 mm       | ~15.9 mm   |
 * | iPhone 15 Plus| 31.7 mm       | ~15.9 mm   |
 *
 * The 14 figure is independently confirmed: the 14 and the 14 Plus are
 * different images with different body widths and land on the same 30.7 mm.
 * Lens figures are softer — a lens rim gives several concentric edges — so they
 * are recorded to the nearest half millimetre and no further.
 *
 * **What the numbers say about the question.** The housings differ by about
 * 2 mm in 30, which is 7%. That is far less than a schematic drawing naturally
 * suggests, and drawing it larger would be inventing a difference the phone
 * does not have. The **lenses** are the better cue at roughly 18%, which is why
 * this pair leans on lens size and why the help text now says so. Even 18% is
 * a fine judgement, so these two diagrams render larger than the rest of the
 * set — the honest ratio needs the room.
 */
import { BodyCrop, DiagramSvg, Housing, Lens, REAR_VIEW_BOX } from './primitives.tsx'

/** Body edges in the shared rear crop, and the body's real width. */
const BODY_LEFT = 14
const BODY_UNITS = 72
const BODY_MM = 71.5

const mm = (v: number) => (v / BODY_MM) * BODY_UNITS

/** Measured off `reference/images/apple/`; see the table above. */
const LARGER = { inset: 4.6, housing: 30.7, lens: 15.8 }
const SMALLER = { inset: 4.4, housing: 29.5, lens: 13.5 }

function DiagonalDual({ spec }: { spec: typeof LARGER }) {
  const x = BODY_LEFT + (spec.inset / 100) * BODY_UNITS
  const size = mm(spec.housing)
  const y = 13
  const r = mm(spec.lens) / 2

  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={x} y={y} width={size} height={size} radius={size * 0.31} accent />
      <Lens cx={x + size * 0.29} cy={y + size * 0.29} r={r} accent />
      <Lens cx={x + size * 0.71} cy={y + size * 0.71} r={r} accent />
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
