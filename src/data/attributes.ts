/**
 * Attribute schema — SPEC.md §6.1 (coarse tier) and §6.2 (deep tier).
 *
 * This file declares which values each attribute is *allowed* to take. Which
 * models actually take them lives in `models.ts`, transcribed from
 * `reference/models/` (D-11). A test asserts the two agree, so a typo in the
 * matrix fails the build rather than silently creating an eleventh layout.
 */
import type { AttributeDefinition, AttributeId, AttributeValue } from './types.ts'

/**
 * The descriptive colour palette — SPEC.md §6.5, settled by Phase 1 in
 * `reference/palette.md`. Fourteen values, deliberately coarse: two shades that
 * are plausibly confusable at a workbench under shop lighting are one value.
 *
 * The engine matches on these only. Apple's marketing names are display text
 * and never narrow the candidate set (D-12).
 */
export const palette: AttributeValue[] = [
  'black',
  'white_silver',
  'gold',
  'red',
  'pink',
  'purple',
  'light_blue',
  'dark_blue',
  'light_green',
  'dark_green',
  'yellow',
  'orange',
  'coral',
  'teal',
]

export const attributes: AttributeDefinition[] = [
  // Coarse tier — asked in the main flow (§6.1).
  {
    id: 'home_button',
    tier: 'coarse',
    values: ['present', 'absent'],
  },
  {
    id: 'port',
    tier: 'coarse',
    values: ['lightning', 'usb_c'],
  },
  {
    id: 'rear_camera_count',
    tier: 'coarse',
    values: ['1', '2', '3'],
  },
  {
    id: 'rear_camera_layout',
    tier: 'coarse',
    values: [
      'single_lens_flash_beside',
      'single_lens_in_pill',
      'single_lens_no_housing',
      'dual_horizontal_pill',
      'dual_vertical_pill',
      'dual_vertical_square',
      'dual_diagonal_square',
      'dual_vertical_slim_pill',
      'triple_square',
      'plateau_oval_single',
      'plateau_bar_triple',
    ],
  },
  {
    id: 'front_cutout',
    tier: 'coarse',
    values: ['bezels_no_cutout', 'notch_wide', 'notch_narrow', 'dynamic_island'],
  },
  {
    // Three bands, not the five §6.3 first drew (D-30), and exactly one of them
    // per model (D-31). The old fourth band had no members of its own — nothing
    // was `large` alone — so it was an option a technician could pick that
    // matched no phone's own class, and picking it narrowed further than the
    // truthful answer did. It was reachable only because a model could carry a
    // second, adjacent class; D-31 removed that, the redrawn bands having moved
    // every boundary off the bodies and into 5 mm of empty space.
    id: 'body_size_class',
    tier: 'coarse',
    values: ['small', 'standard', 'large'],
  },
  {
    id: 'sim_tray',
    tier: 'coarse',
    values: ['none', 'left_side', 'right_side'],
  },
  {
    id: 'colour',
    tier: 'coarse',
    values: palette,
  },

  // Deep tier — offered only behind "Narrow further" (§6.2, D-03).
  {
    id: 'action_button',
    tier: 'deep',
    values: ['present', 'absent'],
  },
  {
    id: 'camera_control_button',
    tier: 'deep',
    values: ['present', 'absent'],
  },
  {
    id: 'magsafe',
    tier: 'deep',
    values: ['present', 'absent'],
  },
  {
    id: 'frame_material_finish',
    tier: 'deep',
    values: [
      'aluminium_glossy',
      'aluminium_matte',
      'aluminium_brushed',
      'stainless_glossy',
      'titanium_brushed',
      'titanium_polished',
    ],
  },
  {
    id: 'back_glass_finish',
    tier: 'deep',
    values: ['glossy', 'matte', 'ceramic_shield'],
  },
  {
    id: 'rear_wordmark',
    tier: 'deep',
    values: ['iphone_text_present', 'logo_only_centred'],
  },
  {
    // Hole counts either side of the port. Photographed and counted only for
    // the iPhone X, XS and XS Max, which is the only group it separates; every
    // other model is absent here and so survives any answer (§5.4).
    //
    // The `asymmetric` catch-all §6.2 once listed is deliberately gone. It was
    // a *superset* of the three specific counts, and the matching rule treats
    // values as mutually exclusive — so a technician who truthfully counted
    // three and six on an iPhone 11 eliminated it and was shown an iPhone XS.
    id: 'bottom_mic_hole_pattern',
    tier: 'deep',
    values: ['symmetric_six_six', 'asymmetric_three_six', 'asymmetric_four_seven'],
  },
  {
    // Relative, not absolute: larger or smaller *than the other models sharing
    // that rear_camera_layout* (§6.2). Only recorded where it breaks a tie.
    id: 'camera_bump_size',
    tier: 'deep',
    values: ['larger', 'smaller'],
  },
  {
    id: 'flash_position',
    tier: 'deep',
    values: [
      'below_lens',
      'beside_lens_on_glass',
      'between_lenses',
      'in_square_right',
      'outside_bump_right',
      'in_plateau_right',
    ],
  },
  {
    id: 'lidar',
    tier: 'deep',
    values: ['present', 'absent'],
  },
]

const byId = new Map(attributes.map((attribute) => [attribute.id, attribute]))

export function attributeById(id: AttributeId): AttributeDefinition | undefined {
  return byId.get(id)
}
