/**
 * The question set — SPEC.md §4.1 (identify flow), §4.3 (deep tier), §5.4 (the
 * `Question` type), §6 (attribute taxonomy) and §7 (question selection).
 *
 * One question per attribute in `attributes.ts`: eight coarse, asked in the main
 * flow, and ten deep, offered only behind "Narrow further" (D-03). Every option
 * value is a value that attribute is allowed to take, and every allowed value
 * appears exactly once — a test asserts both, so a typo here fails the build
 * rather than quietly making an answer unmatchable.
 *
 * Three things deliberately absent:
 *
 * - **"Can't tell".** It is on every question as a UI affordance (§4.2, D-09),
 *   not as a data value, so it is not in any `options` array.
 * - **Diagram components.** `src/diagrams/` draws them (§8); the `diagram` ids
 *   here are the contract between the two, and `registry.test.ts` checks it
 *   holds in both directions. They are set only where a picture is what the
 *   technician actually needs — layouts, cutouts, size silhouettes, flash
 *   position, hole patterns, bump size, wordmark — and left off where a word
 *   does the job. Within a question it is all or nothing, so a screen never
 *   renders half a row of pictures.
 * - **Model names.** Prompts describe what is in the technician's hand, never
 *   which model it might be; the help text names a model only where the spec
 *   already does, to say how far an answer will get them.
 *
 * `priority` breaks ties when information gain is close (§7 step 3), so quick
 * whole-hand checks beat checks needing close inspection. Three bands:
 * 90-100 whole-hand and instant, 50-70 easy but needs a proper look, 10-40
 * needs close inspection, a reference outline, or an accessory. Every value is
 * distinct so the ordering is deterministic.
 */
import type { AttributeId, Question } from './types.ts'

/**
 * The warning carried by both `camera_bump_size` options.
 *
 * The attribute stays eliminating, because it is the only thing separating the
 * iPhone 13 from the 14 once the coarse tier is exhausted. But Phase 4 measured
 * what it asks a technician to judge — 29.5 mm of housing against 30.7 mm — and
 * a 7% difference is close to the limit of what an eye can call against a
 * drawing. The help text states the magnitude; this puts the escape hatch on
 * the rows themselves, where the tap happens.
 */
const CAMERA_BUMP_CAVEAT =
  'A fine call — about 2 mm in 30. If it does not read clearly against the outline, answer "Can’t tell" rather than guessing.'

export const questions: Question[] = [
  // Coarse tier — asked in the main flow (§6.1).
  {
    id: 'rear_camera_layout',
    tier: 'coarse',
    prompt: 'Which rear camera arrangement matches the phone?',
    help: 'Match the housing as well as the lenses: whether they sit straight on the back glass, in a pill, in a large rounded square, or in a plateau running across the back. Ignore the small round microphone hole. Two of these are a single lens on bare glass with the flash beside it, and they differ only in how big the lens is — compare them against the drawings rather than from memory.',
    options: [
      {
        value: 'single_lens_flash_beside',
        label: 'One small lens on the glass, flash beside it',
        diagram: 'rear-camera-layout-single-lens-flash-beside',
      },
      {
        value: 'single_lens_in_pill',
        label: 'One lens and the flash together in a raised upright pill',
        diagram: 'rear-camera-layout-single-lens-in-pill',
      },
      {
        value: 'single_lens_no_housing',
        label: 'One large lens standing proud of the glass, flash beside it',
        diagram: 'rear-camera-layout-single-lens-no-housing',
      },
      {
        value: 'dual_horizontal_pill',
        label: 'Two lenses side by side in one raised pill',
        diagram: 'rear-camera-layout-dual-horizontal-pill',
      },
      {
        value: 'dual_vertical_pill',
        label: 'Two lenses stacked in a raised pill, flash between them',
        diagram: 'rear-camera-layout-dual-vertical-pill',
      },
      {
        value: 'dual_vertical_square',
        label: 'Two lenses stacked down the left of a large rounded square',
        diagram: 'rear-camera-layout-dual-vertical-square',
      },
      {
        value: 'dual_diagonal_square',
        label: 'Two lenses set diagonally in a large rounded square',
        diagram: 'rear-camera-layout-dual-diagonal-square',
      },
      {
        value: 'dual_vertical_slim_pill',
        label: 'Two lenses stacked in a slim pill, flash outside it on the glass',
        diagram: 'rear-camera-layout-dual-vertical-slim-pill',
      },
      {
        value: 'triple_square',
        label: 'Three lenses in a triangle in a large rounded square',
        diagram: 'rear-camera-layout-triple-square',
      },
      {
        value: 'plateau_oval_single',
        label: 'One lens in a raised oval plateau across the top of the back',
        diagram: 'rear-camera-layout-plateau-oval-single',
      },
      {
        value: 'plateau_bar_triple',
        label: 'Three lenses in a raised bar running nearly the full width',
        diagram: 'rear-camera-layout-plateau-bar-triple',
      },
    ],
    priority: 100,
    eliminating: true,
  },
  {
    id: 'home_button',
    tier: 'coarse',
    prompt: 'Is there a round Home button below the screen?',
    help: 'A physical round button set into the bottom bezel, not an on-screen bar. It counts as present even if it is smashed or will not click.',
    options: [
      { value: 'present', label: 'Yes — a round button below the screen' },
      { value: 'absent', label: 'No — the screen runs down to the bottom edge' },
    ],
    priority: 98,
    eliminating: true,
  },
  {
    id: 'port',
    tier: 'coarse',
    prompt: 'What shape is the charging port on the bottom edge?',
    help: 'Lightning is a narrow flat slot with the contacts on one face. USB-C is wider and rounder, with a small tongue standing in the middle of it. If the port is chewed up, offer a cable and see which one seats.',
    options: [
      { value: 'lightning', label: 'Lightning — narrow flat slot, nothing inside it' },
      { value: 'usb_c', label: 'USB-C — wider oval slot with a tongue in the middle' },
    ],
    priority: 96,
    eliminating: true,
  },
  {
    id: 'front_cutout',
    tier: 'coarse',
    prompt: 'What is at the top of the screen?',
    help: 'A wide notch runs about a third of the way across and holds the earpiece slot in its bottom edge. A narrow notch is the same shape but clearly shorter, because the earpiece moved up into the bezel above it. A Dynamic Island is a free-floating pill with screen all the way around it, touching nothing.',
    options: [
      {
        value: 'bezels_no_cutout',
        label: 'No cutout — solid bands above and below the screen',
        diagram: 'front-cutout-bezels-no-cutout',
      },
      {
        value: 'notch_wide',
        label: 'A wide notch, earpiece slot inside it',
        diagram: 'front-cutout-notch-wide',
      },
      {
        value: 'notch_narrow',
        label: 'A narrow notch, earpiece slot in the bezel above it',
        diagram: 'front-cutout-notch-narrow',
      },
      {
        value: 'dynamic_island',
        label: 'A free-floating pill with screen all around it',
        diagram: 'front-cutout-dynamic-island',
      },
    ],
    priority: 94,
    eliminating: true,
  },
  {
    // §6.1 asks whether this still earns its place next to rear_camera_layout,
    // which subsumes it. Kept: it is the fastest check in the set and costs one
    // tap, and the engine will rank it below the layout question by information
    // gain anyway (§7 step 2) whenever the layout question is available.
    id: 'rear_camera_count',
    tier: 'coarse',
    prompt: 'How many camera lenses are on the back?',
    help: 'Count glass lenses only. The flash, the small round microphone hole and the flat black LiDAR dot are none of them lenses.',
    options: [
      { value: '1', label: 'One lens' },
      { value: '2', label: 'Two lenses' },
      { value: '3', label: 'Three lenses' },
    ],
    priority: 92,
    eliminating: true,
  },
  {
    id: 'body_size_class',
    tier: 'coarse',
    prompt: 'Which outline is closest to the size of the body?',
    help: 'Judge the body, not the screen — an iPhone 8 Plus has a small screen in a large body. Hold the phone against the outlines rather than measuring. Neighbouring sizes overlap by a few millimetres, so expect this to narrow the field rather than settle it.',
    options: [
      {
        value: 'mini',
        label: 'Mini — noticeably smaller than everything else',
        diagram: 'body-size-class-mini',
      },
      {
        value: 'compact',
        label: 'Compact — the small home-button body',
        diagram: 'body-size-class-compact',
      },
      {
        value: 'standard',
        label: 'Standard — the usual modern size',
        diagram: 'body-size-class-standard',
      },
      {
        value: 'large',
        label: 'Large — a step up from standard',
        diagram: 'body-size-class-large',
      },
      {
        value: 'max',
        label: 'Max — the biggest bodies, Plus and Pro Max',
        diagram: 'body-size-class-max',
      },
    ],
    priority: 90,
    eliminating: true,
  },
  {
    /**
     * Colour is an eliminating question per D-08, and it is the one attribute
     * that can fail unsafely: a rehoused phone or a replaced back answers
     * wrongly and takes the correct model out of the running (§6.4). If that
     * starts happening on the bench, flipping `eliminating` to false here is the
     * whole revert — the answer then ranks candidates instead of removing them.
     */
    id: 'colour',
    tier: 'coarse',
    prompt: 'What colour is the phone — judging by the original back glass only?',
    help: 'Rehousings and replacement backs are common, and a replacement is often a colour the model never shipped in, which will rule out the right model. If the back has been changed, or you cannot say it has not, skip this one. Pick the nearest shade: the palette is deliberately coarse, so several Apple colour names share one answer here.',
    options: [
      { value: 'black', label: 'Black or dark grey' },
      { value: 'white_silver', label: 'White or silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'red', label: 'Red' },
      { value: 'pink', label: 'Pink' },
      { value: 'purple', label: 'Purple' },
      { value: 'light_blue', label: 'Light blue' },
      { value: 'dark_blue', label: 'Dark blue' },
      { value: 'light_green', label: 'Light green' },
      { value: 'dark_green', label: 'Dark green' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'orange', label: 'Orange' },
      { value: 'coral', label: 'Coral' },
      { value: 'teal', label: 'Teal' },
    ],
    priority: 70,
    eliminating: true,
  },
  {
    // Worded so that "no tray" reads as information about the market, not as a
    // reason to rule a model out (§6.1). Models sold both ways carry both
    // values in the matrix, so neither answer eliminates them.
    id: 'sim_tray',
    tier: 'coarse',
    prompt: 'Is there a SIM tray in the edge of the phone, and which side?',
    help: 'This tells you where the phone was sold more than which model it is. The tray moved from the right edge to the left at the iPhone 12, and from the iPhone 14 on a US unit has no tray at all while the same model sold elsewhere does. No tray therefore rules nothing out on its own.',
    options: [
      { value: 'none', label: 'No tray — nothing in either edge' },
      { value: 'left_side', label: 'Left edge, below the volume buttons' },
      { value: 'right_side', label: 'Right edge, below the side button' },
    ],
    priority: 66,
    eliminating: true,
  },

  // Deep tier — offered only behind "Narrow further" (§4.3, §6.2, D-03).
  {
    id: 'action_button',
    tier: 'deep',
    prompt: 'Above the volume buttons, is there a sliding switch or a button?',
    help: 'The Action button replaced the ring/silent switch and sits in the same place. The difference is how it moves: the old switch slides between two positions and shows an orange strip in one of them, the Action button presses in and does not slide.',
    options: [
      { value: 'present', label: 'A button that presses in — the Action button' },
      { value: 'absent', label: 'A switch that slides — the ring/silent switch' },
    ],
    priority: 62,
    eliminating: true,
  },
  {
    id: 'camera_control_button',
    tier: 'deep',
    prompt: 'Is there a Camera Control button on the lower right edge?',
    help: 'A glassy strip about a fingertip wide, below the side button, set flush with the frame. It barely moves, so look for the change in surface rather than a raised key.',
    options: [
      { value: 'present', label: 'Yes — a flush glassy strip below the side button' },
      { value: 'absent', label: 'No — the right edge is bare below the side button' },
    ],
    priority: 58,
    eliminating: true,
  },
  {
    id: 'lidar',
    tier: 'deep',
    prompt: 'Is there a LiDAR scanner in the camera housing?',
    help: 'A flat black dot the size of a lens, sitting beside the flash, with no glass ring and no reflection in it. Under a light a lens gives you a coloured glint; the LiDAR dot stays dead black.',
    options: [
      { value: 'present', label: 'Yes — a flat black dot beside the flash' },
      { value: 'absent', label: 'No — only lenses and the flash' },
    ],
    priority: 54,
    eliminating: true,
  },
  {
    id: 'rear_wordmark',
    tier: 'deep',
    prompt: 'Is the word iPhone printed on the back?',
    help: 'Older bodies carry the Apple logo in the upper third with the wordmark under it. Later ones moved the logo to the centre of the back and dropped the wordmark. The regulatory small print near the bottom edge is not the wordmark.',
    options: [
      {
        value: 'iphone_text_present',
        label: 'Logo in the upper third, wordmark below it',
        diagram: 'rear-wordmark-iphone-text-present',
      },
      {
        value: 'logo_only_centred',
        label: 'Logo alone, centred on the back',
        diagram: 'rear-wordmark-logo-only-centred',
      },
    ],
    priority: 50,
    eliminating: true,
  },
  {
    id: 'flash_position',
    tier: 'deep',
    prompt: 'Where does the flash sit relative to the lenses?',
    help: 'The flash is the pale oval that glints yellow. The plain black hole the same size next to it is the microphone, and the flat black dot inside the housing on Pro models is the LiDAR scanner.',
    options: [
      {
        value: 'below_lens',
        label: 'Directly below the single lens',
        diagram: 'flash-position-below-lens',
      },
      {
        value: 'beside_lens_on_glass',
        label: 'Beside the lens, out on the bare back glass',
        diagram: 'flash-position-beside-lens-on-glass',
      },
      {
        value: 'between_lenses',
        label: 'Between the two lenses',
        diagram: 'flash-position-between-lenses',
      },
      {
        value: 'in_square_right',
        label: 'Inside the square housing, on the right',
        diagram: 'flash-position-in-square-right',
      },
      {
        value: 'outside_bump_right',
        label: 'Outside the camera pill, on the glass to its right',
        diagram: 'flash-position-outside-bump-right',
      },
      {
        value: 'in_plateau_right',
        label: 'Inside the plateau, to the right of the lenses',
        diagram: 'flash-position-in-plateau-right',
      },
    ],
    priority: 40,
    eliminating: true,
  },
  {
    id: 'frame_material_finish',
    tier: 'deep',
    prompt: 'What is the frame around the edge made of, and how is it finished?',
    help: 'Turn the phone in a good light and look at the flat band. Stainless steel is mirror-bright, heavy, and takes fingerprints instantly. Aluminium is duller and lighter — glossy aluminium shines but never mirrors. Brushed finishes show a fine grain running along the edge; matte anodising is smooth and flat.',
    options: [
      {
        value: 'aluminium_glossy',
        label: 'Aluminium, glossy — shiny but not a mirror',
      },
      {
        value: 'aluminium_matte',
        label: 'Aluminium, matte — smooth anodised, no shine',
      },
      {
        value: 'aluminium_brushed',
        label: 'Aluminium, brushed — fine grain along the edge',
      },
      { value: 'stainless_glossy', label: 'Stainless steel — mirror polished, heavy' },
      {
        value: 'titanium_brushed',
        label: 'Titanium, brushed — grained, warmer grey than steel',
      },
      { value: 'titanium_polished', label: 'Titanium, polished — bright and even' },
    ],
    priority: 34,
    eliminating: true,
  },
  {
    id: 'back_glass_finish',
    tier: 'deep',
    prompt: 'Is the back glossy or matte?',
    help: 'Glossy glass mirrors the room and picks up fingerprints. Matte glass is textured, scatters the reflection and feels faintly grippy. Ceramic Shield backs are the newest and hardest to call by eye, so pick that one only if you already know the phone has one — otherwise judge glossy against matte, or skip.',
    options: [
      { value: 'glossy', label: 'Glossy — mirrors the room, holds fingerprints' },
      { value: 'matte', label: 'Matte — textured, scatters the reflection' },
      { value: 'ceramic_shield', label: 'Ceramic Shield — not conventional glass' },
    ],
    priority: 30,
    eliminating: true,
  },
  {
    // Works on a dead phone, which is why it is modelled as an attribute rather
    // than left as prose on the result screen (§4.4): it is the only thing that
    // separates a 16e from a 17e.
    id: 'magsafe',
    tier: 'deep',
    prompt: 'Does a magnetic accessory snap onto the middle of the back?',
    help: 'Take any case off first — some cases carry their own magnets — then hold a MagSafe puck or magnetic mount against the centre of the back. On a phone with the magnet ring it pulls itself into place and stays; without it, it slides straight off. Nothing needs to power on for this.',
    options: [
      { value: 'present', label: 'It snaps into place and holds itself' },
      { value: 'absent', label: 'It will not hold — no magnets' },
    ],
    priority: 24,
    eliminating: true,
  },
  {
    // Relative, never absolute (§6.2): the answer only means anything against
    // the other models sharing this rear_camera_layout, which is why the help
    // insists on the side-by-side outlines and why the matrix records it for
    // one layout family only.
    id: 'camera_bump_size',
    tier: 'deep',
    prompt:
      'Held against these two outlines, which camera housing is the phone closer to?',
    help: 'This is a comparison, not a measurement. Larger and smaller mean larger or smaller than the other models with the same camera arrangement, so answer it only with the two outlines drawn side by side at the same body width — hold the phone against them. The two housings differ by about 2 mm in 30, which is less than it sounds; the lenses are the better cue, being about a fifth wider on the larger one. If neither reads clearly, say so — "Can\'t tell" rules nothing out.',
    options: [
      {
        value: 'larger',
        label: 'The larger housing — wider footprint, bigger lenses',
        diagram: 'camera-bump-size-larger',
        caveat: CAMERA_BUMP_CAVEAT,
      },
      {
        value: 'smaller',
        label: 'The smaller housing — tighter footprint, smaller lenses',
        diagram: 'camera-bump-size-smaller',
        caveat: CAMERA_BUMP_CAVEAT,
      },
    ],
    priority: 18,
    eliminating: true,
  },
  {
    id: 'bottom_mic_hole_pattern',
    tier: 'deep',
    prompt: 'How many holes are drilled either side of the charging port?',
    help: 'Count the holes in the bottom edge, left of the port and then right of it. Use a bright light and take your time — the counts are close together. This one only ever separates the iPhone X, XS and XS Max from each other, so if the count you see is not one of these three, answer "Can\'t tell" — that is the honest answer and it rules nothing out.',
    options: [
      {
        value: 'symmetric_six_six',
        label: 'Six on the left, six on the right — equal',
        diagram: 'bottom-mic-hole-pattern-symmetric-six-six',
      },
      {
        value: 'asymmetric_three_six',
        label: 'Three on the left, six on the right',
        diagram: 'bottom-mic-hole-pattern-asymmetric-three-six',
      },
      {
        value: 'asymmetric_four_seven',
        label: 'Four on the left, seven on the right',
        diagram: 'bottom-mic-hole-pattern-asymmetric-four-seven',
      },
    ],
    priority: 12,
    eliminating: true,
  },
]

const byId = new Map(questions.map((question) => [question.id, question]))

export function questionById(id: AttributeId): Question | undefined {
  return byId.get(id)
}
