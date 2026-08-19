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
- `flash_position` is read off the committed product shots at enlargement and verified for
  all 37 models. The iPhone Air needed its image reshot in Sky Blue plus a straight-on rear
  detail — on the Space Black body the plateau is black-on-black, and both back-and-front
  shots hide the flash behind the front handset. That pass corrected four values: the iPhone 8,
  8 Plus, SE (2nd) and SE (3rd) place the flash _beside_ the camera on the bare glass,
  not below the lens as first recorded.
- `camera_bump_size` was re-evidenced after an audit found it citing a comparison of the
  iPhone 13 Pro Max and 14 Pro Max, a different camera system from the non-Pro pair it
  was attached to. All six diagonal-dual models are now measured off the product shots
  with each body normalised to the same width.
- `bottom_mic_hole_pattern` is photographed and verified for the iPhone X,
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
- **🔴 unverified** covers 35 rows, every one a value that was **deliberately not
  researched** rather than one attempted and failed: `camera_bump_size` outside the
  `dual_diagonal_square` family (31), and `bottom_mic_hole_pattern` on the home-button
  bodies (4). Neither was needed to separate anything. **Do not transcribe these into
  `src/data/models.ts`** — leave them absent.

  The flag is doing double duty: it means both "could not be sourced" and "was not
  researched", and everything left is the second kind. Phase 2 should consider splitting
  them, since the current reading makes the data look worse than it is.

One flag is worth questioning in Phase 2: the 30 models carrying a bare `asymmetric`
`bottom_mic_hole_pattern` are marked 🟡, but their Source column is `—`. Nothing was
consulted; the value is a generalisation from the iPhone X onward. It is harmless because
the attribute only discriminates within the X / XS / XS Max group, but by the standard set
out above it is closer to 🔴 than 🟡.

Row totals across the 37 models: **498 verified, 133 inferred, 35 unverified.**
