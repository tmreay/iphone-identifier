# iPhone 8 Plus

**Model id:** `iphone-8-plus` · **Released:** 2017 · **Generation:** 2017

> Phase 1 research output. Every row cites a source or is explicitly flagged as
> unverified. Nothing here may be transcribed into `src/data/` without its flag
> being read first (SPEC.md §10, D-11).

## Body

| Fact    | Value                                                                      | Source |
| ------- | -------------------------------------------------------------------------- | ------ |
| Height  | 158.4 mm                                                                   | S1     |
| Width   | 78.1 mm                                                                    | S1     |
| Depth   | 7.5 mm                                                                     | S1     |
| Weight  | 202 grams                                                                  | S1     |
| Display | 5.5-inch (diagonal) widescreen LCD Multi-Touch display with IPS technology | S1     |

## Coarse-tier attributes (SPEC.md §6.1)

| Attribute            | Value(s)                                  | Confidence  | Source | Note                                                                                                                                                                                                           |
| -------------------- | ----------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home_button`        | `present`                                 | ✅ verified | S1     | Home button with Touch ID.                                                                                                                                                                                     |
| `port`               | `lightning`                               | ✅ verified | S1     | Listed under External Buttons and Connectors.                                                                                                                                                                  |
| `rear_camera_count`  | `2`                                       | ✅ verified | S1     |                                                                                                                                                                                                                |
| `rear_camera_layout` | `dual_horizontal_pill`                    | 🟡 inferred | —      | Two lenses side by side **horizontally**, in one raised pill across the top left of the back. **Arrangement described from the researcher's reading, not a cited source — confirm against a reference image.** |
| `front_cutout`       | `bezels_no_cutout`                        | ✅ verified | S3     | Top and bottom bezels, round Home button, no display cutout.                                                                                                                                                   |
| `body_size_class`    | `max`                                     | ✅ verified | S1     | Derived from body height 158.4 mm against the bands in SPEC.md §6.3. An adjacent class is added only when a model actually in that class sits within 3 mm — see SPEC.md §6.3.                                  |
| `sim_tray`           | `right_side`                              | ✅ verified | S2     | SIM tray on the right side, below the side button. Present in all markets.                                                                                                                                     |
| `colour`             | `gold` · `white_silver` · `black` · `red` | 🟡 inferred | S1     | Marketing names are Apple's; the descriptive mapping is this project's (see `reference/palette.md`).                                                                                                           |

## Deep-tier attributes (SPEC.md §6.2)

| Attribute                 | Value                  | Confidence        | Source | Note                                                                                                                                                                                 |
| ------------------------- | ---------------------- | ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `action_button`           | `absent`               | ✅ verified       | S1     | Ring/Silent switch fitted instead.                                                                                                                                                   |
| `camera_control_button`   | `absent`               | ✅ verified       | S1     |                                                                                                                                                                                      |
| `magsafe`                 | `absent`               | ✅ verified       | S1     | No MagSafe. Apple's tech specs list Qi wireless charging with no magnet array; MagSafe did not exist before the iPhone 12.                                                           |
| `frame_material_finish`   | `aluminium_matte`      | 🟡 inferred       | S3     | Anodised aluminium, matte.                                                                                                                                                           |
| `back_glass_finish`       | `glossy`               | 🟡 inferred       | S3     | Glossy glass.                                                                                                                                                                        |
| `rear_wordmark`           | `iphone_text_present`  | ✅ verified       | S5     | Apple logo in the upper third with the word "iPhone" below it. Regulatory text below that varies by region.                                                                          |
| `bottom_mic_hole_pattern` | — (not researched)     | 🔴 unverified     | —      | Only researched where it discriminates (iPhone X vs XS).                                                                                                                             |
| `camera_bump_size`        | —                      | ⚪ not applicable | —      | Not applicable. The value is relative to a `rear_camera_layout` family (SPEC.md §6.2) and this model is outside the diagonal-dual family, so there is nothing to compare it against. |
| `flash_position`          | `beside_lens_on_glass` | ✅ verified       | —      | To the right of the pill on the bare glass, level with the lenses, past the mic hole — outside the housing, not inside it. Read off the committed product shot at enlargement.       |
| `lidar`                   | `absent`               | ✅ verified       | S1     |                                                                                                                                                                                      |

## Colours (SPEC.md §6.5)

| Descriptive value | Apple marketing name | Note |
| ----------------- | -------------------- | ---- |
| `gold`            | Gold                 |      |
| `white_silver`    | Silver               |      |
| `black`           | Space Gray           |      |
| `red`             | (PRODUCT)RED         |      |

All marketing names from S1. Descriptive values per `reference/palette.md`.

## Cautions

- Colour can be wrong on a rehoused phone or one with replaced back glass (SPEC.md §6.4). Treat a colour answer as evidence, not proof.

## Sources

- **S1** — Apple — iPhone 8 Plus Tech Specs — <https://support.apple.com/en-us/111950> (fetched 2026-08-19)
- **S2** — Apple — Remove or switch the SIM card in your iPhone — <https://support.apple.com/en-us/109357> (fetched 2026-08-19)
- **S3** — Wikipedia — iPhone 8 Plus — <https://en.wikipedia.org/wiki/IPhone_8> (fetched 2026-08-19)
- **S4** — Apple product image, committed as reference/images/apple/iphone-8-plus.jpg — <https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone8-plus-gold-select-2017?wid=1800&hei=1800&fmt=jpeg&qlt=95> (fetched 2026-08-19)
- **S5** — The Apple Post — Apple to remove the word "iPhone" from the back of the 2019 models — <https://www.theapplepost.com/2019/08/16/34120/apple-to-remove-word-iphone-from-back-of-the-2019-models-according-to-so-called-factory-worker/> (fetched 2026-08-19)

## Reference images

![iPhone 8 Plus](../images/apple/iphone-8-plus.jpg)

`reference/images/apple/iphone-8-plus.jpg` — Apple's own product shot: one device, back and
front, straight on and unobstructed at 1012x1170. From <https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone8-plus-gold-select-2017?wid=1800&hei=1800&fmt=jpeg&qlt=95>
(downloaded 2026-08-19).

Not captured for this model: the bottom edge (port and mic/speaker hole pattern)
and the side edges. See `reference/images/README.md`.
