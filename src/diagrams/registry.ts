/**
 * The diagram registry — SPEC.md §8.
 *
 * `questions.ts` names diagrams by id and knows nothing about React; this is
 * the one place the two meet. The ids are the contract that file already
 * declared, so the map is written out in full rather than derived from a naming
 * convention: a convention would let a renamed component silently stop
 * rendering, where a missing key here fails `registry.test.ts`.
 *
 * Kept apart from `index.tsx` so that file exports a component and nothing
 * else, which is what the fast-refresh lint rule asks for.
 */
import type { ComponentType } from 'react'

import {
  BodySizeClassCompact,
  BodySizeClassLarge,
  BodySizeClassMax,
  BodySizeClassMini,
  BodySizeClassStandard,
} from './bodySizeClass.tsx'
import {
  BottomMicHolePatternAsymmetricFourSeven,
  BottomMicHolePatternAsymmetricThreeSix,
  BottomMicHolePatternSymmetricSixSix,
} from './bottomMicHolePattern.tsx'
import { CameraBumpSizeLarger, CameraBumpSizeSmaller } from './cameraBumpSize.tsx'
import {
  FlashPositionBelowLens,
  FlashPositionBesideLensOnGlass,
  FlashPositionBetweenLenses,
  FlashPositionInPlateauRight,
  FlashPositionInSquareRight,
  FlashPositionOutsideBumpRight,
} from './flashPosition.tsx'
import {
  FrontCutoutBezelsNoCutout,
  FrontCutoutDynamicIsland,
  FrontCutoutNotchNarrow,
  FrontCutoutNotchWide,
} from './frontCutout.tsx'
import {
  RearCameraLayoutDualDiagonalSquare,
  RearCameraLayoutDualHorizontalPill,
  RearCameraLayoutDualVerticalPill,
  RearCameraLayoutDualVerticalSlimPill,
  RearCameraLayoutDualVerticalSquare,
  RearCameraLayoutPlateauBarTriple,
  RearCameraLayoutPlateauOvalSingle,
  RearCameraLayoutSingleLensFlashBeside,
  RearCameraLayoutSingleLensInPill,
  RearCameraLayoutSingleLensNoHousing,
  RearCameraLayoutTripleSquare,
} from './rearCameraLayout.tsx'
import {
  RearWordmarkIphoneTextPresent,
  RearWordmarkLogoOnlyCentred,
} from './rearWordmark.tsx'

export const diagrams: Record<string, ComponentType> = {
  'rear-camera-layout-single-lens-flash-beside': RearCameraLayoutSingleLensFlashBeside,
  'rear-camera-layout-single-lens-in-pill': RearCameraLayoutSingleLensInPill,
  'rear-camera-layout-single-lens-no-housing': RearCameraLayoutSingleLensNoHousing,
  'rear-camera-layout-dual-horizontal-pill': RearCameraLayoutDualHorizontalPill,
  'rear-camera-layout-dual-vertical-pill': RearCameraLayoutDualVerticalPill,
  'rear-camera-layout-dual-vertical-square': RearCameraLayoutDualVerticalSquare,
  'rear-camera-layout-dual-diagonal-square': RearCameraLayoutDualDiagonalSquare,
  'rear-camera-layout-dual-vertical-slim-pill': RearCameraLayoutDualVerticalSlimPill,
  'rear-camera-layout-triple-square': RearCameraLayoutTripleSquare,
  'rear-camera-layout-plateau-oval-single': RearCameraLayoutPlateauOvalSingle,
  'rear-camera-layout-plateau-bar-triple': RearCameraLayoutPlateauBarTriple,

  'front-cutout-bezels-no-cutout': FrontCutoutBezelsNoCutout,
  'front-cutout-notch-wide': FrontCutoutNotchWide,
  'front-cutout-notch-narrow': FrontCutoutNotchNarrow,
  'front-cutout-dynamic-island': FrontCutoutDynamicIsland,

  'body-size-class-mini': BodySizeClassMini,
  'body-size-class-compact': BodySizeClassCompact,
  'body-size-class-standard': BodySizeClassStandard,
  'body-size-class-large': BodySizeClassLarge,
  'body-size-class-max': BodySizeClassMax,

  'rear-wordmark-iphone-text-present': RearWordmarkIphoneTextPresent,
  'rear-wordmark-logo-only-centred': RearWordmarkLogoOnlyCentred,

  'flash-position-below-lens': FlashPositionBelowLens,
  'flash-position-beside-lens-on-glass': FlashPositionBesideLensOnGlass,
  'flash-position-between-lenses': FlashPositionBetweenLenses,
  'flash-position-in-square-right': FlashPositionInSquareRight,
  'flash-position-outside-bump-right': FlashPositionOutsideBumpRight,
  'flash-position-in-plateau-right': FlashPositionInPlateauRight,

  'camera-bump-size-larger': CameraBumpSizeLarger,
  'camera-bump-size-smaller': CameraBumpSizeSmaller,

  'bottom-mic-hole-pattern-symmetric-six-six': BottomMicHolePatternSymmetricSixSix,
  'bottom-mic-hole-pattern-asymmetric-three-six':
    BottomMicHolePatternAsymmetricThreeSix,
  'bottom-mic-hole-pattern-asymmetric-four-seven':
    BottomMicHolePatternAsymmetricFourSeven,
}

/**
 * Diagrams that render larger than the rest of the set.
 *
 * `camera_bump_size` is drawn to measured scale (see `cameraBumpSize.tsx`), and
 * the real difference between the two housings is about 7%. At the size the
 * other diagrams use, 7% is a couple of pixels. Exaggerating it would be
 * inventing a difference the phone does not have, so the drawing keeps the true
 * ratio and takes the room it needs instead.
 */
export const largeDiagrams = new Set([
  'camera-bump-size-larger',
  'camera-bump-size-smaller',
])
