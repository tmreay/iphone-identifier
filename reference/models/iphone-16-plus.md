# iPhone 16 Plus

**Model id:** `iphone-16-plus` · **Released:** 2024 · **Generation:** 2024

> Phase 1 research output. Every row cites a source or is explicitly flagged as
> unverified. Nothing here may be transcribed into `src/data/` without its flag
> being read first (SPEC.md §10, D-11).

## Body

| Fact                         | Value                                                                                            | Source |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| Height                       | 160.9 mm                                                                                         | S1     |
| Width                        | 77.8 mm                                                                                          | S1     |
| Depth                        | 7.80 mm                                                                                          | S1     |
| Weight                       | 199 grams                                                                                        | S1     |
| Display                      | 6.7‑inch (diagonal) all‑screen OLED display                                                      | S1     |
| Apple's material description | Aluminum design, Ceramic Shield front, Color-infused glass back (Black, Pink, Teal, Ultramarine) | S1     |

## Coarse-tier attributes (SPEC.md §6.1)

| Attribute            | Value(s)                                                 | Confidence  | Source | Note                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home_button`        | `absent`                                                 | ✅ verified | S1     | No home button; Face ID.                                                                                                                                                                                   |
| `port`               | `usb_c`                                                  | ✅ verified | S1     | Listed under External Buttons and Connectors.                                                                                                                                                              |
| `rear_camera_count`  | `2`                                                      | ✅ verified | S1     |                                                                                                                                                                                                            |
| `rear_camera_layout` | `dual_vertical_slim_pill`                                | ✅ verified | S4     | Two lenses stacked **vertically** in a slim raised pill; the flash sits **outside** the pill, on the back glass to its right.                                                                              |
| `front_cutout`       | `dynamic_island`                                         | ✅ verified | S1     | Pill-shaped Dynamic Island cutout, detached from the top edge.                                                                                                                                             |
| `body_size_class`    | `max`                                                    | ✅ verified | S1     | Derived from body height 160.9 mm against the bands in SPEC.md §6.3. An adjacent class is added only when a model actually in that class sits within 3 mm — see SPEC.md §6.3.                              |
| `sim_tray`           | `left_side` · `none`                                     | ✅ verified | S2     | SIM tray on the left side on units sold outside the United States. US-purchased units have **no SIM tray at all** (eSIM only). Both bodies are in circulation, so tray presence narrows region, not model. |
| `colour`             | `black` · `white_silver` · `pink` · `teal` · `dark_blue` | 🟡 inferred | S1     | Marketing names are Apple's; the descriptive mapping is this project's (see `reference/palette.md`).                                                                                                       |

## Deep-tier attributes (SPEC.md §6.2)

| Attribute                 | Value                | Confidence    | Source | Note                                                                                                                                                      |
| ------------------------- | -------------------- | ------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action_button`           | `present`            | ✅ verified   | S1     | Replaces the ring/silent switch.                                                                                                                          |
| `camera_control_button`   | `present`            | ✅ verified   | S1     | Capacitive button on the lower right edge.                                                                                                                |
| `magsafe`                 | `present`            | ✅ verified   | S1     | Apple's tech specs state MagSafe wireless charging explicitly.                                                                                            |
| `frame_material_finish`   | `aluminium_matte`    | ✅ verified   | S1     | Anodised aluminium, matte.                                                                                                                                |
| `back_glass_finish`       | `matte`              | ✅ verified   | S1     | Textured matte glass.                                                                                                                                     |
| `rear_wordmark`           | `logo_only_centred`  | 🟡 inferred   | S5     | Apple logo centred, no "iPhone" wordmark. Cited source covers the 2019 change; continuation to this model is assumed — confirm against a reference image. |
| `bottom_mic_hole_pattern` | `asymmetric`         | 🟡 inferred   | —      | Asymmetric, as on every model after the iPhone X. Only useful for the X/XS pair.                                                                          |
| `camera_bump_size`        | — (n/a)              | 🔴 unverified | —      | Not a discriminator for this model.                                                                                                                       |
| `flash_position`          | `outside_bump_right` | ✅ verified   | S3     | Outside the camera pill, on the back glass to its right. Read off the committed reference image, and re-checked against the clean product shot.           |
| `lidar`                   | `absent`             | ✅ verified   | S1     |                                                                                                                                                           |

## Colours (SPEC.md §6.5)

| Descriptive value | Apple marketing name | Note |
| ----------------- | -------------------- | ---- |
| `black`           | Black                |      |
| `white_silver`    | White                |      |
| `pink`            | Pink                 |      |
| `teal`            | Teal                 |      |
| `dark_blue`       | Ultramarine          |      |

All marketing names from S1. Descriptive values per `reference/palette.md`.

## Cautions

- US and non-US bodies differ: a missing SIM tray does **not** rule this model out, and a present tray does not rule out a US-market sibling generation.
- Colour can be wrong on a rehoused phone or one with replaced back glass (SPEC.md §6.4). Treat a colour answer as evidence, not proof.

## Sources

- **S1** — Apple — iPhone 16 Plus Tech Specs — <https://support.apple.com/en-us/121030> (fetched 2026-08-19)
- **S2** — Apple — Remove or switch the SIM card in your iPhone — <https://support.apple.com/en-us/109357> (fetched 2026-08-19)
- **S3** — Apple product image, committed as reference/images/apple/iphone-16-plus.jpg — <https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-black-select-202409?wid=1800&hei=1800&fmt=jpeg&qlt=95> (fetched 2026-08-19)
- **S4** — MacRumors — First iPhone 16 Cases Outline New Rear Vertical Camera Bump — <https://www.macrumors.com/2024/03/29/first-iphone-16-cases-vertical-camera-bump/> (fetched 2026-08-19)
- **S5** — 9to5Mac — Cases show iPhone 11 design, including new position of Apple logo — <https://9to5mac.com/2019/09/08/purported-iphone-11-cases-show-new-position-for-apple-logo-on-iphone-11-back/> (fetched 2026-08-19)

## Reference images

![iPhone 16 Plus](../images/apple/iphone-16-plus.jpg)

`reference/images/apple/iphone-16-plus.jpg` — Apple's own product shot: one device, back and
front, straight on and unobstructed at 1264x1558. From <https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-black-select-202409?wid=1800&hei=1800&fmt=jpeg&qlt=95>
(downloaded 2026-08-19).

Not captured for this model: the bottom edge (port and mic/speaker hole pattern)
and the side edges. See `reference/images/README.md`.
