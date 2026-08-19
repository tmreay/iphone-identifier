# iPhone Identifier — Specification

**Status:** draft v1 · **Last updated:** 2026-08-19

A local web app that walks a repair-shop technician through a short series of
questions about a phone's *visible* characteristics until it identifies which
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

iPhone 8 through the iPhone 17 generation — **36 models**:

| Generation | Models |
|---|---|
| 2017 | iPhone 8 · iPhone 8 Plus · iPhone X |
| 2018 | iPhone XR · iPhone XS · iPhone XS Max |
| 2019 | iPhone 11 · iPhone 11 Pro · iPhone 11 Pro Max |
| 2020 | iPhone SE (2nd gen) · iPhone 12 mini · iPhone 12 · iPhone 12 Pro · iPhone 12 Pro Max |
| 2021 | iPhone 13 mini · iPhone 13 · iPhone 13 Pro · iPhone 13 Pro Max |
| 2022 | iPhone SE (3rd gen) · iPhone 14 · iPhone 14 Plus · iPhone 14 Pro · iPhone 14 Pro Max |
| 2023 | iPhone 15 · iPhone 15 Plus · iPhone 15 Pro · iPhone 15 Pro Max |
| 2024 | iPhone 16 · iPhone 16 Plus · iPhone 16 Pro · iPhone 16 Pro Max |
| 2025 | iPhone 16e · iPhone Air · iPhone 17 · iPhone 17 Pro · iPhone 17 Pro Max |

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

1. The app holds a candidate set, initially all 36 models.
2. It asks the single most useful **coarse-tier** question for the current
   candidate set (see §7).
3. The technician picks an answer; candidates inconsistent with it are
   eliminated. The app shows a live count of remaining candidates.
4. Repeat until one model remains, or until coarse-tier questions are exhausted.
5. **One model left** → result screen (§4.5).
   **More than one** → group screen with a *Narrow further* action (§4.3).

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
*Narrow further* tap.

### 4.4 Terminal ambiguity

Some pairs cannot be separated visually at all. The app must state this plainly
rather than guess or ask pointless questions:

> **iPhone SE (2nd gen) or iPhone SE (3rd gen)** — these are externally
> identical. No visible characteristic distinguishes them.

Where a non-visual tiebreaker exists and the device might power on, the app may
suggest it (Settings → General → About → Model Name) — always as a hint, never
as a required step.

### 4.5 Result screen

**Model name only.** e.g. "iPhone 13 Pro Max". Plus:

- the answer trail that led there,
- a *Start over* action,
- a link into the reverse-lookup entry for that model, so the tech can confirm
  the phone in hand matches every listed characteristic.

No A-numbers, specs, or repair notes — deliberately out of scope (§3.2).

### 4.6 Reverse lookup

A browsable list of all 36 models. Selecting one shows every characteristic the
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
reference/            Phase 1 research output — sourced facts and images
  models/<id>.md
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
type ModelId = string;              // 'iphone-13-pro-max'
type AttributeId = string;          // 'rear_camera_layout'
type AttributeValue = string;       // 'dual_diagonal'

interface IPhoneModel {
  id: ModelId;
  name: string;                     // 'iPhone 13 Pro Max'
  released: number;                 // year
  /**
   * For each attribute, the set of values consistent with this model.
   * Multiple values are legitimate: a model has many colours, may span two
   * adjacent size classes, and may ship in both SIM-tray and eSIM-only bodies.
   * An absent or empty entry means "unknown" and eliminates nothing.
   */
  attributes: Partial<Record<AttributeId, AttributeValue[]>>;
}

interface QuestionOption {
  value: AttributeValue;
  label: string;
  diagram?: string;                 // diagram component id
  caveat?: string;                  // shown inline, e.g. rehousing warning
}

interface Question {
  id: AttributeId;
  tier: 'coarse' | 'deep';
  prompt: string;
  help?: string;
  options: QuestionOption[];
  /** Higher = prefer asking earlier when information gain is close. */
  priority: number;
  /** If false, an answer ranks candidates but never eliminates them. */
  eliminating: boolean;             // see §6.4
}
```

**Matching rule.** An answer `v` to attribute `a` eliminates model `M` if and
only if `M.attributes[a]` is present and non-empty and does not contain `v`.
Missing data never eliminates — an incomplete matrix degrades to a larger
candidate group, never to a wrong answer.

## 6. Attribute taxonomy

Values below define the *schema*. Which models take which values is Phase 1 work
(§10) and is not asserted here.

### 6.1 Coarse tier — asked in the main flow

| Attribute | Values |
|---|---|
| `home_button` | present · absent |
| `port` | lightning · usb_c |
| `rear_camera_count` | 1 · 2 · 3 |
| `rear_camera_layout` | single · dual_horizontal · dual_vertical · dual_diagonal · triple_square · plateau_bar · *(refine in Phase 1)* |
| `front_cutout` | bezels_no_cutout · notch_wide · notch_narrow · dynamic_island |
| `body_size_class` | mini · compact · standard · large · max (§6.3) |
| `sim_tray` | none · left_side · right_side |
| `colour` | per Phase 1 enumeration |

### 6.2 Deep tier — Narrow further only

| Attribute | Values |
|---|---|
| `action_button` | present · absent (replaces the ring/silent switch) |
| `camera_control_button` | present · absent |
| `frame_material_finish` | aluminium_glossy · stainless_glossy · aluminium_matte · titanium_brushed · titanium_polished |
| `back_glass_finish` | glossy · matte |
| `rear_wordmark` | iphone_text_present · logo_only_centred · logo_only_upper |
| `bottom_mic_hole_pattern` | *(Phase 1 — the iPhone X vs XS tell)* |
| `camera_bump_size` | *(Phase 1 — the iPhone 13 vs 14 tell)* |
| `flash_position` | *(Phase 1)* |
| `lidar` | present · absent |

### 6.3 Size classes

Judged by **body size**, not screen diagonal — an iPhone 8 Plus has a small
screen in a large body. Five bands, by overall body height:

| Class | Approx. body height | Character |
|---|---|---|
| `mini` | under ~135 mm | noticeably smaller than everything else |
| `compact` | ~135–142 mm | the 4.7-inch home-button bodies |
| `standard` | ~142–150 mm | the default modern size |
| `large` | ~150–156 mm | |
| `max` | ~156 mm and up | Plus and Pro Max bodies |

Generation-to-generation drift means neighbouring classes overlap by a few
millimetres and a technician cannot reliably tell them apart by eye. Therefore:

- a model may list **two adjacent classes** as consistent values;
- size is a coarse narrowing signal, expected to reduce the candidate set, not
  to resolve it;
- the UI presents size as silhouette comparisons, not as measurements.

### 6.4 Soft attributes

`colour` is treated as a normal eliminating question, per decision D-08. It is
the one attribute that can fail *unsafely* — a rehoused phone or replaced back
glass can eliminate the correct model. Mitigations:

- the option label reads "colour (original back glass only)";
- the "Can't tell" option is prominent and its help text names rehousing;
- the `eliminating` flag on the question makes reverting this a one-line change
  if it causes wrong answers in practice.

## 7. Question selection

Given the current candidate set:

1. Consider only unanswered, unskipped questions of the active tier.
2. Score each by **information gain** — the expected reduction in candidate
   count, treating remaining models as equally likely.
3. Break ties by `priority`, so quick whole-hand checks (home button, port,
   camera count) win over checks that need close inspection.
4. Stop when one candidate remains, or no question can further split the set.

The algorithm is deterministic and must be covered by unit tests, including a
test that asserts **every model is reachable** — that for each model there
exists an answer path leading to it alone, or to a documented terminal group
(§4.4).

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
`reference/images/` and are not shipped in the build.

## 9. Known hard cases

To be validated and, where possible, solved during Phase 1 and the engine tests:

| Pair | Situation |
|---|---|
| SE (2nd) vs SE (3rd) | Externally identical. Documented terminal group. |
| iPhone X vs XS | Near-identical; bottom mic-hole pattern and colour availability are the reported tells. |
| iPhone 13 vs 14 | Same size and camera arrangement; camera bump proportions and US SIM-tray absence are the tells. |
| iPhone 8 vs SE (2nd/3rd) | Same body; rear "iPhone" wordmark and logo position differ. |
| iPhone 12 vs 12 Pro, and similar | Separated by camera count; confirm no other trap. |
| Pro vs Pro Max within a generation | Size class only — expect these to resolve late. |

## 10. Phases

**Phase 0 — environment.** Vite + React + TypeScript project, Vitest, repo
layout per §5.3, this spec committed. *(current)*

**Phase 1 — data collection.** *Separate session.* Web research to establish
verified, sourced specifications and physical characteristics for all 36 models,
plus reference screenshots for diagram drawing. Output:
`reference/models/<id>.md`, one per model, each fact carrying a source, and
images in `reference/images/`. Explicit goals:

- confirm the value sets in §6.1 and §6.2, and fill the `(Phase 1)` gaps;
- record body dimensions so §6.3 class assignments are evidence-based;
- confirm which generations and regions ship without a SIM tray, and which side
  the tray sits on;
- enumerate colours per model;
- verify the iPhone 16e, iPhone Air and iPhone 17 generation in particular —
  these are recent and must not be written from memory;
- capture front and rear reference images per model.

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

| # | Decision |
|---|---|
| D-01 | Coverage is iPhone 8 → iPhone 17 generation, including iPhone Air, 16e, and both SE generations. |
| D-02 | Attribute matrix with dynamic question selection, not a hand-authored decision tree. Adding a model is one data row. |
| D-03 | Coarse questions by default; micro-detail questions behind an explicit "Narrow further" step. |
| D-04 | Vite + React + TypeScript, static build, offline-capable. |
| D-05 | Hand-drawn SVG schematics rather than photographs. |
| D-06 | Result screen shows the model name only. |
| D-07 | Both US and international body variants are in scope; SIM-tray presence is a real discriminator. |
| D-08 | Colour is a normal eliminating question, with rehousing caveats and an escape hatch (§6.4). |
| D-09 | "Can't tell" on every question; the engine routes around unavailable attributes and never eliminates on missing data. |
| D-10 | Size is expressed as five body-size classes with permitted overlap, never as measurements. |
| D-11 | Data verification (Phase 1) happens before any matrix authoring, in its own session, and everything is sourced. |

## 12. Open questions

- Colour naming: Apple's marketing names ("Sierra Blue") or plain descriptive
  ones ("light blue")? Marketing names are precise but a technician will not know
  them. *Leaning plain descriptive, grouped into a small palette.*
- Should the reverse-lookup view be editable in-app, or is correcting the data
  strictly a code change? *Leaning code change.*
- How the built app is served at the shop — copied to each device, or served
  from one machine on the LAN.
