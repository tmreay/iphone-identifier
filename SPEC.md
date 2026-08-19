# iPhone Identifier — Specification

**Status:** draft v1.1 · **Last updated:** 2026-08-19

A local web app that walks a repair-shop technician through a short series of
questions about a phone's _visible_ characteristics until it identifies which
iPhone model is on the bench.

---

## 1. Problem

Technicians in a repair shop regularly cannot tell which iPhone model they are
holding. Devices arrive smashed, powered-off, rehoused, or in cases; modern
iPhones carry no printed model number on the body; and many generations look
near-identical to the untrained eye. Misidentification means ordering the wrong
screen, battery, or back glass.

## 2. Users and context

- **Primary user:** a repair technician at a workbench, phone in hand.
- **Device:** a phone or tablet on the shop network, or the built app copied
  locally. Must work **offline**.
- **Conditions:** the device under test is frequently non-functional. The app
  must never assume the phone powers on, that Settings can be read, or that any
  part is original.
- **Distribution:** internal only. Not a public product.

## 3. Scope

### 3.1 Models covered

iPhone 8 through the iPhone 17e — **37 models**:

| Generation | Models                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| 2017       | iPhone 8 · iPhone 8 Plus · iPhone X                                                  |
| 2018       | iPhone XR · iPhone XS · iPhone XS Max                                                |
| 2019       | iPhone 11 · iPhone 11 Pro · iPhone 11 Pro Max                                        |
| 2020       | iPhone SE (2nd gen) · iPhone 12 mini · iPhone 12 · iPhone 12 Pro · iPhone 12 Pro Max |
| 2021       | iPhone 13 mini · iPhone 13 · iPhone 13 Pro · iPhone 13 Pro Max                       |
| 2022       | iPhone SE (3rd gen) · iPhone 14 · iPhone 14 Plus · iPhone 14 Pro · iPhone 14 Pro Max |
| 2023       | iPhone 15 · iPhone 15 Plus · iPhone 15 Pro · iPhone 15 Pro Max                       |
| 2024       | iPhone 16 · iPhone 16 Plus · iPhone 16 Pro · iPhone 16 Pro Max                       |
| 2025       | iPhone 16e · iPhone Air · iPhone 17 · iPhone 17 Pro · iPhone 17 Pro Max              |
| 2026       | iPhone 17e                                                                           |

Both **US (eSIM-only, no SIM tray)** and **international (SIM tray)** body
variants are in scope where they differ physically.

### 3.2 Non-goals

- Models older than iPhone 8.
- iPad, Apple Watch, or any non-iPhone device.
- Storage capacity, carrier lock, IMEI, or serial-number lookup.
- Repair guidance, part numbers, part compatibility, or pricing.
- Photo/AI recognition. Identification is question-driven only.
- Any network dependency at runtime.

## 4. Product behaviour

### 4.1 Identify flow

1. The app holds a candidate set, initially all 37 models.
2. It asks the single most useful **coarse-tier** question for the current
   candidate set (see §7).
3. The technician picks an answer; candidates inconsistent with it are
   eliminated. The app shows a live count of remaining candidates.
4. Repeat until one model remains, or until coarse-tier questions are exhausted.
5. **One model left** → result screen (§4.5).
   **More than one** → group screen with a _Narrow further_ action (§4.3).

The technician can go **back** one step at any time, and **start over**. The
answer trail is visible so a wrong answer can be spotted and corrected.

### 4.2 "Can't tell" handling

Every question carries a **Can't tell / not visible** option. Choosing it:

- eliminates nothing,
- marks that attribute as permanently unavailable for this session,
- moves on to the next-most-useful question.

If unresolved attributes are the only thing standing between candidates, the
result screen says so explicitly ("these two differ only by rear logo position,
which you skipped") and offers to revisit.

### 4.3 Narrow further (deep tier)

Deep-tier questions cover micro-details that require close inspection — bottom
mic-hole patterns, rear logo position and wordmark, camera bump proportions,
frame finish, flash placement. They are never asked in the main flow. They are
offered only when the coarse tier leaves more than one candidate, on an explicit
_Narrow further_ tap.

### 4.4 Terminal ambiguity

Some pairs cannot be separated visually at all. The app must state this plainly
rather than guess or ask pointless questions:

> **iPhone SE (2nd gen) or iPhone SE (3rd gen)** — these are externally
> identical. No visible characteristic distinguishes them.

There are **three** such groups, not one (§9): SE (2nd)/SE (3rd), iPhone 16/17 in black or
white, and iPhone 16e/17e in black or white.

Where a non-visual tiebreaker exists and the device might power on, the app may
suggest it (Settings → General → About → Model Name) — always as a hint, never
as a required step.

Prefer a tiebreaker that works on a **dead** phone where one exists. For 16e vs 17e a
magnetic accessory settles it: the 17e supports MagSafe and the 16e does not, so a puck
snaps to one and slides off the other. That is modelled as the `magsafe` deep-tier
attribute (§6.2) rather than as prose on the result screen, so the engine can use it. No
such test is known for 16 vs 17 — both have MagSafe, Camera Control and an Action button.

### 4.5 Result screen

**Model name only.** e.g. "iPhone 13 Pro Max". Plus:

- the answer trail that led there,
- a _Start over_ action,
- a link into the reverse-lookup entry for that model, so the tech can confirm
  the phone in hand matches every listed characteristic.

No A-numbers, specs, or repair notes — deliberately out of scope (§3.2).

### 4.6 Reverse lookup

A browsable list of all 37 models. Selecting one shows every characteristic the
matrix records for it, with the same SVG diagrams used in the questions. Used
for training new technicians, for confirming a result, and as the practical way
to review and correct the underlying data.

## 5. Architecture

### 5.1 Stack

- **Vite + React + TypeScript**, built to a static bundle.
- No backend, no runtime data fetching, no analytics.
- No UI component library unless a concrete need appears; plain CSS.
- **Vitest** for engine unit tests.

### 5.2 Layers

```
data/      attribute definitions, question definitions, the model matrix
engine/    pure TypeScript: candidate filtering, question selection.
           No React imports. Fully unit-testable.
diagrams/  SVG React components, one per answer option
ui/        screens: Identify, Result, Reverse Lookup
```

The engine must remain pure and framework-free so the matrix can be validated by
tests independently of the UI.

### 5.3 Repo layout

```
SPEC.md
reference/            Phase 1 research output — sourced facts and images.
  models/<id>.md      Committed to the repo (D-13), not bundled into the build.
  images/
src/
  data/
    attributes.ts     attribute ids and their allowed values
    questions.ts      question text, options, tiers, ordering hints
    models.ts         the attribute matrix
  engine/
  diagrams/
  ui/
```

### 5.4 Data model

```ts
type ModelId = string // 'iphone-13-pro-max'
type AttributeId = string // 'rear_camera_layout'
type AttributeValue = string // 'dual_diagonal'

interface ColourOption {
  /** Palette value the engine matches on, and the question option value. */
  value: AttributeValue // 'dark_blue'
  /** Apple's marketing name for this model in this colour. Display only. */
  marketing: string // 'Pacific Blue'
}

interface IPhoneModel {
  id: ModelId
  name: string // 'iPhone 13 Pro Max'
  released: number // year
  /**
   * For each attribute, the set of values consistent with this model.
   * Multiple values are legitimate: a model has many colours, may span two
   * adjacent size classes, and may ship in both SIM-tray and eSIM-only bodies.
   * An absent or empty entry means "unknown" and eliminates nothing.
   */
  attributes: Partial<Record<AttributeId, AttributeValue[]>>
  /**
   * Colours this model shipped in, carrying both naming layers (§6.5).
   * The set of `value`s must equal attributes.colour — asserted by test.
   */
  colours: ColourOption[]
}

interface QuestionOption {
  value: AttributeValue
  label: string
  diagram?: string // diagram component id
  caveat?: string // shown inline, e.g. rehousing warning
}

interface Question {
  id: AttributeId
  tier: 'coarse' | 'deep'
  prompt: string
  help?: string
  options: QuestionOption[]
  /** Higher = prefer asking earlier when information gain is close. */
  priority: number
  /** If false, an answer ranks candidates but never eliminates them. */
  eliminating: boolean // see §6.4
}
```

**Matching rule.** An answer `v` to attribute `a` eliminates model `M` if and
only if `M.attributes[a]` is present and non-empty and does not contain `v`.
Missing data never eliminates — an incomplete matrix degrades to a larger
candidate group, never to a wrong answer.

## 6. Attribute taxonomy

Values below define the _schema_. Which models take which value is recorded per model
in `reference/models/<id>.md`, which is the source of truth (D-11) — the lists here were
settled against that research and are no longer provisional.

### 6.1 Coarse tier — asked in the main flow

| Attribute            | Values                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home_button`        | present · absent                                                                                                                                                                                                                                      |
| `port`               | lightning · usb_c                                                                                                                                                                                                                                     |
| `rear_camera_count`  | 1 · 2 · 3                                                                                                                                                                                                                                             |
| `rear_camera_layout` | single_lens_flash_below · single_lens_in_pill · single_lens_no_housing · dual_horizontal_pill · dual_vertical_pill · dual_vertical_square · dual_diagonal_square · dual_vertical_slim_pill · triple_square · plateau_oval_single · plateau_bar_triple |
| `front_cutout`       | bezels_no_cutout · notch_wide · notch_narrow · dynamic_island                                                                                                                                                                                         |
| `body_size_class`    | mini · compact · standard · large · max (§6.3)                                                                                                                                                                                                        |
| `sim_tray`           | none · left_side · right_side                                                                                                                                                                                                                         |
| `colour`             | descriptive palette values, per Phase 1 enumeration (§6.5)                                                                                                                                                                                            |

`rear_camera_layout` is the strongest single question in the set — eleven values across
37 models — and it subsumes `rear_camera_count`. Phase 2 should check whether the count
question still earns its place or is pure redundancy.

**`sim_tray` identifies the market, not the model.** The tray moved from the right side
to the left at the iPhone 12, and from the iPhone 14 onward a unit sold in the United
States has no tray at all while the same model sold elsewhere does. Those models therefore
carry **both** `left_side` and `none` as consistent values, and the iPhone Air has no
tray in any market. Word the question so a technician does not read "no SIM tray" as
ruling a model out.

### 6.2 Deep tier — Narrow further only

| Attribute                 | Values                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `action_button`           | present · absent (replaces the ring/silent switch)                                                               |
| `camera_control_button`   | present · absent                                                                                                 |
| `magsafe`                 | present · absent                                                                                                 |
| `frame_material_finish`   | aluminium_glossy · aluminium_matte · aluminium_brushed · stainless_glossy · titanium_brushed · titanium_polished |
| `back_glass_finish`       | glossy · matte · ceramic_shield                                                                                  |
| `rear_wordmark`           | iphone_text_present · logo_only_centred                                                                          |
| `bottom_mic_hole_pattern` | symmetric_six_six · asymmetric_three_six · asymmetric_four_seven · asymmetric                                    |
| `camera_bump_size`        | larger · smaller                                                                                                 |
| `flash_position`          | below_lens · beside_lens_on_glass · between_lenses · in_square_right · outside_bump_right · in_plateau_right     |
| `lidar`                   | present · absent                                                                                                 |

Notes on the less obvious ones:

- **`magsafe`** is the only thing that separates an iPhone 16e from a 17e, and unlike a
  Settings check it works on a phone that will not power on (§4.4). Recorded for all 37
  models from Apple's tech specs: absent on everything before the iPhone 12 and on the
  16e, present on everything else. Apple lists the 16e with Qi wireless charging only,
  and the 17e with a magnet array and alignment magnet.
- **`back_glass_finish`** is no longer a Pro/non-Pro split: the standard models went
  matte at the iPhone 15, and the Air and 17 Pro pair have a Ceramic Shield back.
- **`bottom_mic_hole_pattern`** counts holes either side of the port. It is photographed
  and verified only for the iPhone X (six/six), XS (three/six) and XS Max (four/seven).
  Thirty later models carry a bare `asymmetric` as a generalisation with no source
  consulted, and the four home-button bodies were never researched at all. The attribute
  only ever discriminates inside that group of three, so the weak values cost nothing —
  but they should not be mistaken for evidence.
- **`camera_bump_size`** separates the iPhone 13 generation from the 14 and 15 within the
  diagonal-dual family. Measured off the committed product shots with each body normalised
  to the same width, so the plateau footprint is compared like for like. It does not apply
  outside that family.
- **`rear_wordmark`** has only two members in practice. The third value once listed here,
  `logo_only_upper`, has no members and was dropped.

### 6.3 Size classes

Judged by **body size**, not screen diagonal — an iPhone 8 Plus has a small
screen in a large body. Five bands, by overall body height:

| Class      | Approx. body height | Character                               |
| ---------- | ------------------- | --------------------------------------- |
| `mini`     | under ~135 mm       | noticeably smaller than everything else |
| `compact`  | ~135–142 mm         | the 4.7-inch home-button bodies         |
| `standard` | ~142–150 mm         | the default modern size                 |
| `large`    | ~150–156 mm         |                                         |
| `max`      | ~156 mm and up      | Plus and Pro Max bodies                 |

Generation-to-generation drift means neighbouring classes overlap by a few
millimetres and a technician cannot reliably tell them apart by eye.

A model lists an adjacent class only when a model **actually in that class** sits within
**3 mm** of it. Proximity to a band boundary alone is not enough: the boundary is an
abstraction, and it is the neighbouring handset that gets confused. On the 37-model set
that rule gives eight models two classes — XR, 11, 14 Pro, 15, 16, 16 Pro, 17, 17 Pro, all
`standard` + `large` — and one class to everything else. The iPhone X at 143.6 mm does
not overlap into `compact`, because the nearest compact model (iPhone 8, 138.4 mm) is
5.2 mm away.

Therefore:

- a model may list **two adjacent classes** as consistent values;
- size is a coarse narrowing signal, expected to reduce the candidate set, not
  to resolve it;
- the UI presents size as silhouette comparisons, not as measurements.

### 6.4 Soft attributes

`colour` is treated as a normal eliminating question, per decision D-08. It is
the one attribute that can fail _unsafely_ — a rehoused phone or replaced back
glass can eliminate the correct model. Mitigations:

- the option label reads "colour (original back glass only)";
- the "Can't tell" option is prominent and its help text names rehousing;
- the `eliminating` flag on the question makes reverting this a one-line change
  if it causes wrong answers in practice.

### 6.5 Colour naming

Every colour is recorded under **two names** (D-12):

- a **descriptive value** drawn from a small shared palette — `black`, `white`,
  `silver`, `gold`, `dark_blue`, `light_blue`, `green`, `red`, `purple`,
  `pink`, `yellow`, `orange`, and so on. The final palette is Phase 1 work.
- Apple's **marketing name** for that colour on that model — "Pacific Blue",
  "Sierra Blue", "Alpine Green", "Desert Titanium".

They serve different jobs:

|                                   | Descriptive | Marketing                           |
| --------------------------------- | ----------- | ----------------------------------- |
| Used by the engine to match       | yes         | never                               |
| Question option labels            | yes         | shown as examples beneath the label |
| Reverse-lookup model entry        | yes         | yes, listed in full                 |
| Talking to a supplier or customer | —           | yes                                 |

**Matching is always on the descriptive value.** A technician holding a phone
can pick "dark blue" but has no way to know whether it is Pacific Blue or
Sierra Blue — asking them to choose would invert the problem the app exists to
solve. Marketing names never narrow the candidate set.

Several models therefore share one descriptive value under different marketing
names. That is expected, and is exactly why the descriptive layer exists.

Because the palette is deliberately coarse, keep it coarse: if two shades are
plausibly confusable at a workbench under shop lighting, they are one value.
Splitting them creates a question a technician will answer wrongly.

The result screen still shows the model name only (D-06); colour names belong
to the reverse-lookup entry.

## 7. Question selection

Given the current candidate set:

1. Consider only unanswered, unskipped questions of the active tier.
2. Score each by **information gain** — the expected reduction in candidate
   count, treating remaining models as equally likely.
3. Break ties by `priority`, so quick whole-hand checks (home button, port,
   camera count) win over checks that need close inspection.
4. Stop when one candidate remains, or no question can further split the set.

The algorithm is deterministic and must be covered by unit tests, including:

- **every model is reachable** — for each model there exists an answer path
  leading to it alone, or to a documented terminal group (§4.4). Phase 1 checked this by
  brute force over every _concrete device_ (one real value per attribute) and found 34 of
  37 models resolve to exactly one; the test must assert the three groups in §9 and no
  others, so that a data change which creates a fourth group fails the build;
- **colour layers agree** — every model's `attributes.colour` set equals the
  set of `colours[].value` (§5.4, §6.5);
- **palette is closed** — every colour value used by a model exists in the
  declared palette, and every palette value is used by at least one model.

## 8. Diagrams

Every answer option that describes a shape, layout, or position gets a
hand-drawn **SVG React component**. Rationale: no copyright exposure, sharp at
any size, tiny payload, works offline, and can exaggerate the exact detail that
matters.

Rules:

- schematic and consistent, not photorealistic;
- drawn to relative scale within a question, so silhouettes are comparable;
- monochrome with a single accent colour highlighting the feature in question;
- legible at roughly 120 px wide on a phone screen;
- one component per answer option, ids referenced from `questions.ts`.

Reference screenshots gathered in Phase 1 are the drawing source. They live in
`reference/images/` and **are committed to the repo** (D-13), so a future
session can redraw or correct a diagram without repeating the research. They
are not imported by any module and so never enter the build — the shipped app
contains SVG only.

Keep the repo sane: downscale to roughly 1600 px on the long edge, save as
WebP or JPEG rather than PNG for photographs, and do not commit anything that
does not directly support drawing a diagram or verifying an attribute.

## 9. Known hard cases

Settled by the Phase 1 research and the brute-force separability check (§7). Every model,
in every concrete configuration it can take, was matched against all 37.

**Coarse tier alone** leaves seven ambiguous groups. The deep tier closes four of them,
which is the two-tier split in D-03 earning its place:

| Group                                 | Closed by                                         |
| ------------------------------------- | ------------------------------------------------- |
| iPhone 8 + SE (2nd) + SE (3rd)        | `rear_wordmark`                                   |
| iPhone 13 + iPhone 14                 | `camera_bump_size`                                |
| iPhone 15 Pro + iPhone 16 Pro         | `camera_control_button`                           |
| iPhone 15 Pro Max + iPhone 16 Pro Max | `camera_control_button`                           |
| iPhone X + iPhone XS                  | `bottom_mic_hole_pattern`                         |
| iPhone 16 + iPhone 17                 | **nothing — terminal**                            |
| iPhone 16e + iPhone 17e               | nothing visible — `magsafe` settles it off-screen |

**After both tiers, three groups remain.** 34 of 37 models resolve to exactly one:

| Terminal group       | Situation                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SE (2nd) vs SE (3rd) | Externally identical. Expected; documented from the outset.                                                                                                                                                                                                                                                                                                                                                                                                 |
| iPhone 16 vs 17      | Identical on every attribute in this spec when black or white. Height differs by 2 mm and the display by 0.2 inch — both below what §6.3 says a technician can judge. The 48MP Ultra Wide on the 17 was checked as a possible tell against Apple's product shots and the camera pills are the same. Colour separates them only on the non-shared finishes (16: Pink, Teal, Ultramarine · 17: Mist Blue, Sage, Lavender). **No workbench tiebreaker known.** |
| iPhone 16e vs 17e    | Identical bodies, both notched, single lens, USB-C, Action button. Soft Pink is the only finish that separates them by sight. Solved off-screen by `magsafe` (§4.4).                                                                                                                                                                                                                                                                                        |

There is no iPhone 17 Plus — the iPhone Air took that slot — so the iPhone 16 Plus has no
equivalent twin at `max` size.

`camera_bump_size`, which closes the 13 vs 14 group, was re-evidenced after an audit found
its values citing a comparison of the _Pro Max_ bodies rather than the non-Pro pair they
were attached to. Both plateaus are now measured off Apple's own product shots with each
body normalised to the same width: the 14 generation plateau is visibly wider and its lens
elements larger than the 13 generation. The group is closed on direct evidence.

Two pairs that were expected to be hard turned out not to be: iPhone 12 vs 12 Pro separates
on camera count, and Pro vs Pro Max within a generation separates on size class alone,
resolving late but reliably.

## 10. Phases

**Phase 0 — environment.** Vite + React + TypeScript project, Vitest, repo
layout per §5.3, this spec committed. _(done)_

**Phase 1 — data collection.** _Separate session._ Web research to establish
verified, sourced specifications and physical characteristics for all 37 models,
plus reference screenshots for diagram drawing. Output:
`reference/models/<id>.md`, one per model, each fact carrying a source, and
images in `reference/images/`. Explicit goals:

- confirm the value sets in §6.1 and §6.2, and fill the `(Phase 1)` gaps;
- record body dimensions so §6.3 class assignments are evidence-based;
- confirm which generations and regions ship without a SIM tray, and which side
  the tray sits on;
- enumerate colours per model under **both** naming layers (§6.5) — Apple's
  marketing name and a descriptive palette value — and settle the palette;
- verify the iPhone 16e, iPhone Air and iPhone 17 generation in particular —
  these are recent and must not be written from memory;
- capture front and rear reference images per model, committed to
  `reference/images/` under the size guidance in §8, plus close-ups of every
  micro-detail named in §6.2 and §9.

_(done)_ — 37 model files, 40 images, and the value sets in §6.1/§6.2 above, which were
written from that research. What it changed in this spec: the taxonomy gaps are filled,
§6.3 gained the 3 mm adjacency rule, §9 replaced guesswork with the measured separability
result, and scope went from 36 models to 37 (D-01).

**Phase 1 is done.** All 37 models researched and written up; dimensions and size classes
evidence-based; SIM-tray position and `magsafe` verified for every model from Apple's own
tech specs; `flash_position` and `camera_bump_size` read off the committed product shots;
colours enumerated under both naming layers with a closed 14-value palette; the recent
models verified against shipped Apple documentation rather than pre-release reporting.

Across 666 attribute rows: **498 verified, 133 inferred, 35 unverified.** Thirty-one of the
35 are `camera_bump_size` on models where the attribute does not apply — it only ever
compares within the diagonal-dual family. The genuinely unknown values number **four**:
`bottom_mic_hole_pattern` on the home-button bodies (8, 8 Plus, SE 2nd, SE 3rd), which was
never researched and which costs nothing because the attribute only discriminates inside
the X / XS / XS Max group.

Two evidence gaps remain that are not flag problems:

- **Bottom edges are unphotographed for 34 of 37 models.** Apple never shoots that edge.
  Only the iPhone X, XS and XS Max are covered, which is the only group it separates.
- **The 30 models carrying a bare `asymmetric`** for `bottom_mic_hole_pattern` are marked
  inferred but cite no source. See `reference/README.md`.

Neither blocks Phase 2: under §5.4 an absent value eliminates nothing, so an incomplete
matrix degrades to a larger candidate group rather than a wrong answer.

**Phase 2 — data and engine.** Transcribe `reference/` into `src/data/`; build
and unit-test the engine, including the reachability test in §7.

**Phase 3 — identify UI.** Question flow, can't-tell, back/start-over, answer
trail, result and group screens.

**Phase 4 — diagrams.** Draw the SVG set; wire into questions and reverse
lookup.

**Phase 5 — reverse lookup.** Browsable model list and detail view.

Phases 1 and 2 are strictly ordered. No model attribute may be written into
`src/data/models.ts` from memory — it must trace to `reference/`.

## 11. Decisions log

| #    | Decision                                                                                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Coverage is iPhone 8 → iPhone 17e, including iPhone Air, 16e, and both SE generations. Extended from 36 to 37 models during Phase 1 when the iPhone 17e shipped.                               |
| D-02 | Attribute matrix with dynamic question selection, not a hand-authored decision tree. Adding a model is one data row.                                                                           |
| D-03 | Coarse questions by default; micro-detail questions behind an explicit "Narrow further" step.                                                                                                  |
| D-04 | Vite + React + TypeScript, static build, offline-capable.                                                                                                                                      |
| D-05 | Hand-drawn SVG schematics rather than photographs.                                                                                                                                             |
| D-06 | Result screen shows the model name only.                                                                                                                                                       |
| D-07 | Both US and international body variants are in scope; SIM-tray presence is a real discriminator.                                                                                               |
| D-08 | Colour is a normal eliminating question, with rehousing caveats and an escape hatch (§6.4).                                                                                                    |
| D-09 | "Can't tell" on every question; the engine routes around unavailable attributes and never eliminates on missing data.                                                                          |
| D-10 | Size is expressed as five body-size classes with permitted overlap, never as measurements.                                                                                                     |
| D-11 | Data verification (Phase 1) happens before any matrix authoring, in its own session, and everything is sourced. No model attribute may be written from memory — it must trace to `reference/`. |
| D-12 | Colours carry both an Apple marketing name and a plain descriptive palette value. The engine matches on the descriptive value only (§6.5).                                                     |
| D-13 | Phase 1 reference images are committed to the repo, not kept local. They are never imported into the build.                                                                                    |

D-11 has already paid for itself twice, which is worth recording because both failures
looked like solid data at the time:

- **iPhone 17e Dynamic Island.** Pre-release reporting said the 17e would move to a
  Dynamic Island. It did not — Apple's shipped tech specs list the same 2532 × 1170 notched
  panel as the 16e. Writing that from memory would have put a wrong value on a current
  model. The 16e and 17e are the only two in the set with a notch and no Dynamic Island.
- **iPhone XS Max hole count.** `bottom_mic_hole_pattern` was recorded as three/six for
  both the XS and the XS Max, marked verified, citing a forum answer that discusses only
  the X and the XS. The Max is actually four/seven. A source that does not mention the
  model is not verification, whatever the flag says — the lineage was doing the work and
  was not recorded as such. Nothing downstream broke only because `body_size_class`
  separates that pair anyway.

## 12. Open questions

- Should the reverse-lookup view be editable in-app, or is correcting the data
  strictly a code change? _Leaning code change._
- How the built app is served at the shop — copied to each device, or served
  from one machine on the LAN.
- Where reference images come from, and under what terms. Press images and
  product shots are the practical source but are not ours to redistribute.
  Since the repo is internal and the images are drawing references that never
  ship in the build, this is low risk — but if the repo ever goes public it
  needs revisiting. _Record the source URL for each image in
  `reference/models/<id>.md` so this stays traceable._
