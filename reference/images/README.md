# Reference images

40 files in two sets. Nothing here is imported by the build (D-13); these are the drawing
source for the Phase 4 SVG diagrams and the visual evidence behind the attribute values in
`reference/models/`.

| Set | Files | What it is |
|---|---|---|
| `apple/` | 37 | One per model. Apple's own product shot: a single device, back and front, straight on. **Start here.** |
| `ifixit/` | 3 | The iPhone X, XS and XS Max bottom edges — the one region Apple never photographs. |

## What replaced what

Phase 1 collected 32 Apple *colour lineup* renders — four to six bodies of one model
angled and overlapping, several of them tiny (the iPhone 12 Pro's was 419 × 175). They
were the best thing found at the time, and they were removed on 2026-08-19 once every
model had a clean single-device shot. Nothing referenced them at the point they were
deleted: every model file, and the one citation in SPEC.md §9, now points into
`apple/`.

The 12 `flash_position` values that had been read off the lineup renders were re-checked
against the clean shots before their citations moved, and all 12 agree — `between_lenses`
on the iPhone X, `in_square_right` on the 13/14/14 Plus/15 and the 16 Pro pair,
`outside_bump_right` where the flash sits outside the pill on the 16/16 Plus/17, and
`in_plateau_right` on the 17 Pro pair.

## What these images do and do not show

They show the back and the front: rear camera layout and housing shape, flash position,
Apple logo position, the rear "iPhone" wordmark on models that carry it, the front cutout
(bezel, notch, Dynamic Island), the home button, and the side buttons.

They do **not** show:

- **The bottom edge** — the port with its mic and speaker hole pattern. Covered for the
  iPhone X, XS and XS Max only, in `ifixit/`, and unphotographed for the other 34 models.
- **The side edges**, so the SIM tray side is not visible for any model. `sim_tray` rests
  on Apple's own support documentation instead, which is authoritative, so this is a gap
  in imagery rather than in evidence.
- **A usable iPhone 16 versus iPhone 17 distinction.** They were compared directly and the
  camera pills are the same. See SPEC.md §9.

Resolution is uneven, capped by whatever Apple published: most models land near
1100 × 1500, but the Pro models from the 13 through the 17, plus the iPhone X, 13 and 13
mini, are nearer 500 × 650. Adequate for reading a layout, thin for drawing fine detail.
See `apple/README.md` for the per-model detail and the one three-quarter view in the set.
