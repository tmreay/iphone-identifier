# Phase 1 findings

What the research changed, confirmed, or broke about the assumptions in SPEC.md.
Read this before starting Phase 2.

Scope is **37 models**: the 36 in SPEC §3.1 plus the iPhone 17e, added on the
repo owner's decision during this phase (see §7).

---

## 1. Separability: how far the matrix actually gets

The generated matrix was run through a brute-force check. For every model, every
*concrete device* it could be (one real value per attribute — this colour, this
size class, this SIM-tray state) was enumerated and matched against all 37 models.
288 concrete devices in total.

**Coarse tier alone** leaves seven ambiguous groups:

| Remaining group | Configs | Resolved by |
|---|---|---|
| iPhone 16 + iPhone 17 | 16 | **nothing at all — see §2** |
| iPhone 8 + SE (2nd) + SE (3rd) | 9 | `rear_wordmark` (deep) |
| iPhone 13 + iPhone 14 | 8 | `camera_bump_size` (deep) |
| iPhone 15 Pro + iPhone 16 Pro | 8 | `camera_control_button` (deep) |
| iPhone 15 Pro Max + iPhone 16 Pro Max | 8 | `camera_control_button` (deep) |
| iPhone 16e + iPhone 17e | 8 | **nothing visible — see §2** |
| iPhone X + iPhone XS | 4 | `bottom_mic_hole_pattern` (deep) |

**Coarse + deep tier** leaves three:

| Remaining group | Configs | Status |
|---|---|---|
| iPhone 16 + iPhone 17 | 16 | **new, terminal — no tiebreaker known** |
| iPhone 16e + iPhone 17e | 8 | **new, non-visual tiebreaker available** |
| iPhone SE (2nd) + SE (3rd) | 6 | expected terminal group (SPEC §4.4) |

Everything else in the 37-model set resolves to exactly one model. The two-tier
split in D-03 is doing real work: the deep tier is what closes four of the seven
coarse-tier gaps.

## 2. Two new terminal groups

SPEC §9 anticipated one externally-identical pair. There are three.

### iPhone 16 vs iPhone 17 — terminal, no tiebreaker

A **black or white** iPhone 16 and iPhone 17 are identical on every attribute the
spec defines. Both are USB-C, dual camera in a slim vertical pill with the flash
outside it, Dynamic Island, aluminium matte frame, matte colour-infused back,
Action button, Camera Control, no LiDAR, centred logo, left-side SIM tray outside
the US and none inside it. The colours only separate them where the unit is one of
the non-shared colours (16: Pink, Teal, Ultramarine · 17: Mist Blue, Sage, Lavender).

The real differences are below the threshold §6.3 says a technician cannot judge:

- body height 147.6 mm vs 149.6 mm — a 2 mm difference;
- display 6.1-inch vs 6.3-inch, with slightly slimmer bezels on the 17.

The one candidate tell was checked and does not hold up. The iPhone 17's Ultra
Wide camera is 48MP against the iPhone 16's 12MP, so the lower lens element might
have been visibly larger. Apple's official product images for both models are now
committed (`reference/images/iphone-16-and-16-plus.png` and
`reference/images/iphone-17.png`) and were compared directly: same pill shape,
same vertical arrangement, flash outside the pill to the right on both. Any
difference in lens diameter is far too small to be a workbench tell.

**Treat this as a terminal group** alongside SE (2nd)/SE (3rd), with the
Settings → General → About hint. Unlike the 16e/17e pair below, no non-visual
workbench test is known — both models have MagSafe, Camera Control and an Action
button.

Note there is no iPhone 17 Plus — the iPhone Air took that slot — so the
iPhone 16 Plus has no equivalent twin at `max` size.

### iPhone 16e vs iPhone 17e — solved, but not visually

Identical bodies: both 146.7 × 71.5 × 7.80 mm, both a notch (not a Dynamic
Island), both a single rear lens sitting directly on the back glass, both USB-C
with an Action button and no Camera Control, both aluminium with a glossy glass
back. The 17e's **Soft Pink** finish is the only thing that separates them by
sight; in black or white, nothing does.

**There is a workbench tiebreaker that does not need the phone to power on:** the
iPhone 17e supports MagSafe and the iPhone 16e does not. A MagSafe puck or any
magnetic accessory snaps to a 17e and will not hold on a 16e.

This is worth a small extension to the product design. SPEC §4.4 allows for
non-visual tiebreakers but frames them as a Settings hint for a phone that powers
on. A magnet test works on a dead phone, so it is strictly better here — the group
screen should offer it. Consider a `magsafe` deep-tier attribute so the engine can
use it, rather than treating it as prose on the result screen.

## 3. Taxonomy gaps in SPEC §6.1 / §6.2

The value lists in the spec are short of what the research found. Phase 2 needs:

**`rear_camera_layout`** — the spec's provisional list does not cover the set.
Eleven distinct arrangements are in scope:

| Value | Models |
|---|---|
| `single_lens_flash_below` | 8, SE (2nd), SE (3rd) |
| `single_lens_in_pill` | XR |
| `single_lens_no_housing` | 16e, 17e |
| `dual_horizontal_pill` | 8 Plus |
| `dual_vertical_pill` | X, XS, XS Max |
| `dual_vertical_square` | 11, 12, 12 mini |
| `dual_diagonal_square` | 13, 13 mini, 14, 14 Plus, 15, 15 Plus |
| `dual_vertical_slim_pill` | 16, 16 Plus, 17 |
| `triple_square` | 11 Pro → 16 Pro Max (12 models) |
| `plateau_oval_single` | Air |
| `plateau_bar_triple` | 17 Pro, 17 Pro Max |

This makes `rear_camera_layout` the single strongest coarse question in the set,
and it subsumes `rear_camera_count` — worth checking in Phase 2 whether the count
question still earns its place or is pure redundancy.

**`frame_material_finish`** needs `aluminium_brushed` added (iPhone 17 Pro and
17 Pro Max use a brushed aluminium unibody — the first aluminium Pro chassis).

**`back_glass_finish`** needs `ceramic_shield` added (iPhone Air, 17 Pro,
17 Pro Max have a Ceramic Shield back, not glass). Note also that the standard
models went matte at the iPhone 15 — `back_glass_finish` is not simply a
Pro/non-Pro split any more.

**`rear_wordmark`** — the spec lists three values but only two are used:
`iphone_text_present` (8 through XS Max) and `logo_only_centred` (SE 2nd, 11, and
everything after). `logo_only_upper` has no members and should be dropped.

**`bottom_mic_hole_pattern`** — researched only where it discriminates (X vs XS).
Values used: `symmetric_six_six` (X), `asymmetric_three_six` (XS, XS Max),
`asymmetric` (everything else post-X). Not researched for the home-button models.

**`magsafe`** — proposed new deep-tier attribute, `present` / `absent`. It is the
only thing that separates the 16e from the 17e, and unlike the Settings hint it
works on a dead phone.

## 4. SIM tray: fully resolved, and it is a region signal, not a model signal

Apple publishes the tray position per model, so this attribute is verified for all
37. Three states:

- **right side** — 8, 8 Plus, X, XR, XS, XS Max, 11, 11 Pro, 11 Pro Max,
  SE (2nd), SE (3rd). All markets.
- **left side** — 12 generation onward. The tray moved sides at the iPhone 12.
- **none** — iPhone Air in every market; and every model from the iPhone 14
  onward when purchased in the United States.

The important consequence for the UI: from the iPhone 14 on, tray presence tells
you **where the phone was sold**, not which model it is. Both bodies exist for the
same model. The question must be worded so a technician does not read "no SIM
tray" as ruling a model out — and the engine handles this correctly only because
those models carry both `left_side` and `none` as consistent values.

## 5. Body size classes are now evidence-based

Every height is from Apple's own tech specs. Classes are assigned by the §6.3
bands, with an adjacent class added when a model *actually in that class* sits
within 3 mm — proximity to a band boundary alone is not enough, because the
boundary is an abstraction and the neighbouring handset is what gets confused.

That rule produces overlap for eight models: XR, 11, 14 Pro, 15, 16, 16 Pro,
17, 17 Pro (`standard` + `large`). Everything else lands in one class. The
iPhone X at 143.6 mm does **not** overlap into `compact`, because the nearest
compact model (iPhone 8, 138.4 mm) is 5.2 mm away.

## 6. Confidence: what is safe to transcribe

Every attribute row in every model file carries one of three flags.

- **✅ verified** — traced to a cited source. Covers all of `home_button`,
  `port`, `rear_camera_count`, `body_size_class`, `sim_tray`, `action_button`,
  `camera_control_button`, `lidar`, and dimensions and colour marketing names.
  Safe to transcribe.
- **🟡 inferred** — a reading from an adjacent source or from generation lineage.
  Covers `colour` descriptive mapping, some `rear_camera_layout` values, and
  `rear_wordmark` on models after 2020.
- **🔴 unverified** — `flash_position` on every model, and
  `bottom_mic_hole_pattern` outside the X/XS pair. **Do not transcribe these into
  `src/data/models.ts`.** Leave them absent — under the §5.4 matching rule missing
  data eliminates nothing, so an absent value degrades to a larger candidate
  group rather than a wrong answer.

`flash_position` in particular is entirely unverified. It is a §6.2 attribute the
spec expected Phase 1 to fill, and it could not be filled from text sources — it
needs the reference images.

## 7. iPhone 17e added to scope

Apple released the iPhone 17e in March 2026, after SPEC §3.1 was written. It is
now in scope on the repo owner's decision, bringing the set to **37 models**.
SPEC §3.1 has been updated with a 2026 row.

One correction worth recording, because it is exactly what D-11 exists to prevent:
**pre-release reporting said the 17e would move to a Dynamic Island, and it did
not.** Apple's shipped tech-spec page lists no Dynamic Island and the same
2532×1170 panel as the iPhone 16e, and Daring Fireball's review confirms the notch.
The iPhone 16e and 17e are the only two models in the whole set with a notch and
no Dynamic Island.
