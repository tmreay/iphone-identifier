/**
 * `flash_position` — six placements, SPEC.md §6.2.
 *
 * These six reuse the housings drawn for `rear_camera_layout`, on purpose: the
 * technician has usually just answered that question, and a second, differently
 * drawn back would read as a different phone. What changes is the accent. Here
 * the housing and lenses are plain and only the flash is highlighted, so the
 * picture answers the question actually being asked.
 *
 * The microphone hole is drawn beside the flash wherever the phone has one,
 * because this question's help text exists to stop the two being confused — a
 * diagram showing only the flash would remove the very thing being warned about.
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

/** iPhone XR: inside the pill, under the lens. */
export function FlashPositionBelowLens() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={19} y={13} width={30} height={46} radius={15} />
      <Lens cx={34} cy={27} r={9} />
      <Mic cx={34} cy={40} />
      <Flash cx={34} cy={49} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 8, SE, 16e, 17e: out on the bare glass, level with the lens. */
export function FlashPositionBesideLensOnGlass() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Lens cx={31} cy={27} r={10} />
      <Mic cx={51} cy={24} />
      <Flash cx={60} cy={26} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone X, XS, XS Max: in the pill, between the two lenses. */
export function FlashPositionBetweenLenses() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={19} y={13} width={24} height={48} radius={12} />
      <Lens cx={31} cy={25} r={8} />
      <Flash cx={31} cy={37} r={4.5} accent />
      <Lens cx={31} cy={49} r={8} />
    </DiagramSvg>
  )
}

/** iPhone 11 through 16 Pro Max: inside the square housing, up on the right. */
export function FlashPositionInSquareRight() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={18} y={13} width={42} height={42} radius={13} />
      <Lens cx={30} cy={25} r={8.5} />
      <Mic cx={30} cy={44} />
      <Lens cx={47} cy={42} r={8.5} />
      <Flash cx={48} cy={22} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone 16, 17: off the pill entirely, out on the glass to its right. */
export function FlashPositionOutsideBumpRight() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={20} y={13} width={22} height={44} radius={11} />
      <Lens cx={31} cy={25} r={8} />
      <Lens cx={31} cy={45} r={8} />
      <Mic cx={45} cy={20} />
      <Flash cx={54} cy={27} r={4.5} accent />
    </DiagramSvg>
  )
}

/** iPhone Air, 17 Pro, 17 Pro Max: inside the plateau, right of the lenses. */
export function FlashPositionInPlateauRight() {
  return (
    <DiagramSvg viewBox={REAR_VIEW_BOX}>
      <BodyCrop />
      <Housing x={20} y={13} width={60} height={32} radius={10} />
      <Lens cx={31} cy={21} r={6.5} />
      <Lens cx={31} cy={37} r={6.5} />
      <Lens cx={47} cy={29} r={6.5} />
      <Mic cx={60} cy={29} />
      <Lidar cx={68} cy={37} r={3.6} />
      <Flash cx={68} cy={22} r={4.2} accent />
    </DiagramSvg>
  )
}
