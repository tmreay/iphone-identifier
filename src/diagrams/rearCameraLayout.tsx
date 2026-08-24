/**
 * `rear_camera_layout` — eleven arrangements, SPEC.md §6.1.
 *
 * The question asks about the whole arrangement, so the whole arrangement is
 * accented: housing, lenses and flash together. The microphone hole is drawn
 * plain, because the help text tells the technician to ignore it and a picture
 * that left it out would not match the phone in their hand.
 *
 * Drawn from the product shots in `reference/images/apple/` (§8, D-13). Where a
 * value covers several models they share one arrangement, so one drawing serves
 * them all; the model named in each comment is the one drawn from.
 */
import {
  BodyCrop,
  DiagramSvg,
  REAR_VIEW_BOX,
  Flash,
  Housing,
  Lens,
  Lidar,
  Mic,
} from './primitives.tsx'

/** iPhone 8, SE (2nd/3rd gen): a small lens in a thin raised ring, flash out on the glass beside it. */
export function RearCameraLayoutSingleLensFlashBelow() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Lens cx={30} cy={26} r={7.5} accent />
      <Mic cx={44} cy={26} />
      <Flash cx={52} cy={26} r={3.5} accent />
    </DiagramSvg>
  )
}

/** iPhone XR: lens and flash together inside one upright pill. */
export function RearCameraLayoutSingleLensInPill() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={19} y={13} width={30} height={46} radius={15} accent />
      <Lens cx={34} cy={27} r={9} accent />
      <Mic cx={34} cy={40} />
      <Flash cx={34} cy={49} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 16e, 17e: one large lens standing proud of the glass, no housing around it. */
export function RearCameraLayoutSingleLensNoHousing() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Lens cx={32} cy={28} r={12} accent />
      <Mic cx={52} cy={23} />
      <Flash cx={60} cy={25} r={4} accent />
    </DiagramSvg>
  )
}

/** iPhone 8 Plus: two lenses side by side in one raised pill. */
export function RearCameraLayoutDualHorizontalPill() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={19} y={15} width={42} height={22} radius={11} accent />
      <Lens cx={30} cy={26} r={7.5} accent />
      <Lens cx={50} cy={26} r={7.5} accent />
      <Mic cx={66} cy={20} />
      <Flash cx={72} cy={26} r={4} accent />
    </DiagramSvg>
  )
}

/** iPhone X, XS, XS Max: two lenses stacked in a pill with the flash between them. */
export function RearCameraLayoutDualVerticalPill() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={19} y={13} width={24} height={48} radius={12} accent />
      <Lens cx={31} cy={25} r={8} accent />
      <Flash cx={31} cy={37} r={4.5} accent />
      <Lens cx={31} cy={49} r={8} accent />
    </DiagramSvg>
  )
}

/** iPhone 11, 12, 12 mini: two lenses down the left of a large rounded square. */
export function RearCameraLayoutDualVerticalSquare() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={18} y={13} width={40} height={40} radius={12} accent />
      <Lens cx={30} cy={25} r={8} accent />
      <Lens cx={30} cy={41} r={8} accent />
      <Mic cx={47} cy={17} />
      <Flash cx={47} cy={28} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 13, 14, 15 and their variants: two lenses set diagonally in a rounded square. */
export function RearCameraLayoutDualDiagonalSquare() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={18} y={13} width={42} height={42} radius={13} accent />
      <Lens cx={30} cy={25} r={8.5} accent />
      <Flash cx={48} cy={22} r={4.5} accent />
      <Mic cx={30} cy={44} />
      <Lens cx={47} cy={42} r={8.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 16, 17: two lenses in a slim pill, flash outside it on the glass. */
export function RearCameraLayoutDualVerticalSlimPill() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={20} y={13} width={22} height={44} radius={11} accent />
      <Lens cx={31} cy={25} r={8} accent />
      <Lens cx={31} cy={45} r={8} accent />
      <Mic cx={45} cy={20} />
      <Flash cx={53} cy={27} r={4.5} accent />
    </DiagramSvg>
  )
}

/** Every Pro from the 11 Pro to the 16 Pro Max: three lenses in a triangle, LiDAR bottom right. */
export function RearCameraLayoutTripleSquare() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={17} y={12} width={46} height={46} radius={14} accent />
      <Lens cx={29} cy={24} r={9} accent />
      <Lens cx={29} cy={46} r={9} accent />
      <Lens cx={49} cy={35} r={9} accent />
      <Flash cx={50} cy={19} r={4.5} accent />
      <Mic cx={40} cy={16} />
      <Lidar cx={45} cy={52} r={3.5} />
    </DiagramSvg>
  )
}

/** iPhone Air: one lens in an oval plateau running across the top of the back. */
export function RearCameraLayoutPlateauOvalSingle() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={21} y={13} width={58} height={28} radius={14} accent />
      <Lens cx={36} cy={27} r={9.5} accent />
      <Mic cx={56} cy={27} />
      <Flash cx={67} cy={27} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 17 Pro, 17 Pro Max: three lenses in a bar running nearly the full width. */
export function RearCameraLayoutPlateauBarTriple() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={20} y={13} width={60} height={32} radius={10} accent />
      <Lens cx={31} cy={21} r={6.5} accent />
      <Lens cx={31} cy={37} r={6.5} accent />
      <Lens cx={47} cy={29} r={6.5} accent />
      <Flash cx={68} cy={22} r={4.2} accent />
      <Mic cx={60} cy={29} />
      <Lidar cx={68} cy={37} r={3.6} />
    </DiagramSvg>
  )
}
