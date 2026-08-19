# reference/

Phase 1 output — sourced model facts and reference images. See SPEC.md §10.

Nothing here is imported by the build. It is the evidence layer that
`src/data/models.ts` must trace back to (D-11): no model attribute may be written
into the matrix from memory.

| File             | What it is                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `models/<id>.md` | One file per model. Every attribute row carries a source and a confidence flag. **This is the source of truth.**                                                   |
| `palette.md`     | The colour palette (SPEC §6.5) — 14 descriptive values, the marketing names each covers, and the known risks.                                                      |
| `matrix.md`      | All 37 models in three tables. A reading aid only — it carries no sources, so do not transcribe from it.                                                           |
| `images/apple/`  | 37 clean Apple product shots, one per model — one device, back and front, straight on. The best image for reading a model's outside. See `images/apple/README.md`. |
| `images/ifixit/` | Three iFixit photographs of the iPhone X, XS and XS Max bottom edges — the direct evidence for `bottom_mic_hole_pattern`.                                          |

## Status

- **37 / 37 models** researched and written up (the iPhone 17e was added to scope during this phase — see SPEC.md §11).
- Coarse-tier attributes, dimensions, SIM-tray position and colour marketing names
  are verified against Apple's own tech-spec pages and support documentation.
- `flash_position` is read off the committed images for 12 models and still
  unread for the other 25 — the images exist, they just have not all been
  reviewed. `bottom_mic_hole_pattern` is photographed and verified for the iPhone X,
  XS and XS Max — see `images/ifixit/` — and carries no value on the other 34 models.
  The XS Max value was **corrected** from the photograph: Phase 1 had copied the XS's
  three/six across, and the Max is actually four/seven (SPEC.md §11).
- Separability was checked by brute force. After both tiers three groups remain
  ambiguous: **SE (2nd) vs SE (3rd)** (expected), **iPhone 16 vs iPhone 17** in
  black or white (new, terminal — no tiebreaker known), and **iPhone 16e vs iPhone 17e** in black or
  white (new, but a MagSafe accessory separates them on a dead phone). See
  SPEC.md §9.

## Confidence flags

| Flag          | Meaning                                            | Safe to transcribe?             |
| ------------- | -------------------------------------------------- | ------------------------------- |
| ✅ verified   | Traced to a cited source                           | Yes                             |
| 🟡 inferred   | Read from an adjacent source or generation lineage | Yes, with the caveat recorded   |
| 🔴 unverified | Researcher's reading, no source                    | **No — leave the value absent** |

Leaving an unverified value absent is safe: under the §5.4 matching rule missing
data eliminates nothing, so the result degrades to a larger candidate group rather
than a wrong answer.

Roughly where each flag falls:

- **✅ verified** covers `home_button`, `port`, `rear_camera_count`, `body_size_class`,
  `sim_tray`, `action_button`, `camera_control_button`, `lidar`, the body dimensions,
  and the colour marketing names — all from Apple's own tech specs and support pages.
- **🟡 inferred** covers the descriptive colour mapping (the marketing names are Apple's,
  the palette is this project's), some `rear_camera_layout` values, and `rear_wordmark`
  on models after 2020, where continuation is assumed rather than sourced.
- **🔴 unverified** covers `bottom_mic_hole_pattern` outside the iPhone X / XS / XS Max
  group. **Do not transcribe these into `src/data/models.ts`** — leave them absent.

`flash_position` was the one attribute Phase 1 could not fill from text sources at all;
it is now read off the committed product shots for 12 models and still unread for 25.
