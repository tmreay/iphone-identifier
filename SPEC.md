# iPhone Identifier — Specification

**Status:** draft v1.3 · **Last updated:** 2026-08-25

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
- **Distribution:** internal only. Not a public product. Shipped both as the
  static bundle and as an installable desktop app, **Windows first** (§5.5).

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
   eliminated. The app shows a live count of remaining candidates — as the
   candidate strip, a row of all 37 model names that dims each one as it goes
   out (§12), with the count itself spoken to assistive technology.
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

The offer names only attributes the flow can actually ask again from where it
stands — the question has to still split the candidates _and_ be one the current
tier will offer (D-18). Both halves are the same claim: an offer the flow cannot
honour is worse than no offer, because the technician takes it and nothing
happens.

### 4.3 Narrow further (deep tier)

Deep-tier questions cover micro-details that require close inspection — bottom
mic-hole patterns, rear logo position and wordmark, camera bump proportions,
frame finish, flash placement. They are never asked in the main flow. They are
offered only when the coarse tier leaves more than one candidate, on an explicit
_Narrow further_ tap.

**The deep tier adds questions; it does not take the coarse ones away** (D-17).
The constraint above is on deep questions, and reads as one. On an ordinary run
the difference is invisible — the coarse tier only ends once nothing coarse can
split the candidates, and narrowing further cannot revive one — so it shows up
in exactly one place: a group screen offering to revisit a coarse question the
technician skipped (§4.2). Under a strict reading that question came back to a
pool the flow would never consult again, so the offer did nothing and the
question could not be reached again without starting over.

### 4.4 Terminal ambiguity

Some pairs cannot be separated visually at all. The app must state this plainly
rather than guess or ask pointless questions:

> **iPhone SE (2nd gen) or iPhone SE (3rd gen)** — these are externally
> identical. No visible characteristic distinguishes them.

There are **two** such groups, not one (§9): SE (2nd)/SE (3rd), and iPhone 16/17 in black
or white. Phase 1 counted a third, iPhone 16e/17e, because it scored separability on
visible characteristics alone — but `magsafe` is a matrix attribute and the engine uses
it, so that pair does resolve. See §9.

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
- **Tauri** wraps that same bundle as a desktop app (§5.5). It is packaging, not
  a second target: no Rust logic, no Tauri API calls from the frontend.

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
scripts/
  transcribe.js       reference/models/ -> src/data/models.ts (D-14)
  make-icon.js        draws the app icon, then derives the platform set (§5.5)
src-tauri/            the desktop shell (§5.5). Window config and icons; no logic.
src/
  data/
    types.ts          the shared data model (§5.4)
    attributes.ts     attribute ids and their allowed values
    questions.ts      question text, options, tiers, ordering hints
    models.ts         the attribute matrix — generated, not hand-written
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
   * Multiple values are legitimate: a model has many colours, and may ship in
   * both SIM-tray and eSIM-only bodies. Size is no longer among them — D-28
   * gives every model exactly one `body_size_class`.
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
  caveat?: string // shown inline under the label, e.g. a fine-call warning
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

### 5.5 Desktop packaging

The app **must be installable as a desktop application via Tauri**, and
**Windows is the platform that matters** — that is what the shop runs. macOS and
Linux bundles are appreciated and are built alongside, but they are never the
reason a build exists, and a break on one of them is not a break on the
release (D-29).

Tauri wraps the **same `dist/` the web build produces**. That is the whole
design constraint, and everything else follows from it:

- **`src-tauri/` holds no application logic.** One Rust file, and its only
  statement opens a window. There are no Tauri commands and the frontend makes
  no Tauri API calls, so the bundle cannot come to depend on being in a window.
  §5.2 keeps the engine pure so the matrix can be tested without a UI; a desktop
  shell that reached into Rust would put logic somewhere no Vitest run can see.
- **The web build stays first-class.** §2 has technicians on phones and tablets
  on the shop network, and the desktop app does not replace that. Both are
  produced from one `npm run build`, so they cannot drift.
- **Offline is unchanged.** The bundle already has no runtime network
  dependency (§3.2), and the shell adds none: the capability file grants the
  core defaults and no plugin permissions — no filesystem, no shell, no HTTP.

**Windows ships two files, and the primary one installs nothing.** Tauri
compiles the frontend into the binary, so `iphone-identifier.exe` is by itself
the whole program — about 3 MB, runs from any directory with nothing beside it.
Published as `iPhone Identifier_<version>_x64_portable.exe`, that is what goes on
a bench PC: copy and double-click. It buys the simplest possible deployment at
the cost of the things installation provides — no Start Menu entry, no
uninstaller, and updating is replacing a file.

"Portable" describes the app, not the machine: WebView2 keeps a profile for it
under `%LOCALAPPDATA%\<identifier>\`, a few megabytes, shared by every copy of
the binary on that PC. That is where a half-finished identification survives a
restart. Pinning it beside the executable is possible — the WebView2 loader
reads `WEBVIEW2_USER_DATA_FOLDER` — but it would mean the shell doing something
other than opening a window, which §5.5 otherwise forbids, so it is left alone
until something actually needs it.

The `.msi` alongside it is for the other case: registering the app on a machine
properly, deployable by script or group policy without anyone at the keyboard.
It installs per-machine and so wants administrator rights, which is precisely
the trade that makes it deployable.

An NSIS `-setup.exe` was built and dropped. It sat between the two — a
double-click installer, but still an install — and offering three Windows files
where two cover the cases only invites picking the wrong one.

Two known and accepted frictions, neither worth engineering around at this
scale. Nothing is **signed**, so SmartScreen asks once before the first run;
signing would mean buying a certificate and holding it as a CI secret. And the
**WebView2 runtime** is the one part the build does not carry — Windows 10 1803+
and Windows 11 ship it, so only a machine old enough to lack it needs it
fetched, rather than embedding ~130 MB into every copy. Running the app never
touches the network either way.

Bundles are built by `.github/workflows/desktop.yml`. **Building and releasing
are separate**: a `v*` tag builds every platform and opens a draft release,
while a manual run builds the installers and leaves them as workflow artifacts.
A tag whose name disagrees with `package.json` fails the run rather than
shipping an app that misreports its own version.

It does not run on pull requests. A Rust compile costs minutes on three runners
where the existing checks cost seconds, and it builds a window around a bundle
those checks already cover, so the shell is verified on demand rather than on
every change.

The app icon is **generated, not committed as an opaque binary** — `npm run
icon` draws it from shapes in the app's own palette and derives the platform
set. It is a schematic phone rear with a diagonal dual-camera housing, and like
the diagrams it carries no manufacturer's mark (D-20, §8).

## 6. Attribute taxonomy

Values below define the _schema_. Which models take which value is recorded per model
in `reference/models/<id>.md`, which is the source of truth (D-11) — the lists here were
settled against that research and are no longer provisional.

### 6.1 Coarse tier — asked in the main flow

| Attribute            | Values                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `home_button`        | present · absent                                                                                                                                                                                                                                       |
| `port`               | lightning · usb_c                                                                                                                                                                                                                                      |
| `rear_camera_count`  | 1 · 2 · 3                                                                                                                                                                                                                                              |
| `rear_camera_layout` | single_lens_flash_beside · single_lens_in_pill · single_lens_no_housing · dual_horizontal_pill · dual_vertical_pill · dual_vertical_square · dual_diagonal_square · dual_vertical_slim_pill · triple_square · plateau_oval_single · plateau_bar_triple |
| `front_cutout`       | bezels_no_cutout · notch_wide · notch_narrow · dynamic_island                                                                                                                                                                                          |
| `body_size_class`    | small · standard · large (§6.3)                                                                                                                                                                                                                        |
| `sim_tray`           | none · left_side · right_side                                                                                                                                                                                                                          |
| `colour`             | descriptive palette values, per Phase 1 enumeration (§6.5)                                                                                                                                                                                             |

`rear_camera_layout` is the strongest single question in the set — eleven values across
37 models — and it subsumes `rear_camera_count`.

**Phase 2 checked whether the count question still earns its place. It does, but not as a
question the engine ever chooses.** Across all 226 concrete devices the matrix holds
today the layout question always scores higher, so `rear_camera_count` is never asked and
removing it changes no outcome (Phase 2 established this over the 288 it then held). It is
not redundant, though: the moment the layout is answered "Can't tell" the
count becomes the top-scoring question on every device, and separability is unchanged —
the same two terminal groups, the same 35 models resolving alone. It is kept as the
fallback for §4.2, which is the case it exists for. Both results are asserted by test.

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
| `bottom_mic_hole_pattern` | symmetric_six_six · asymmetric_three_six · asymmetric_four_seven                                                 |
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
  **Every other model is absent on this attribute**, and so survives any answer (§5.4).

  A fourth value, `asymmetric`, was listed here and carried by thirty models as a
  generalisation with no source consulted. **Phase 2 removed it, because a catch-all
  cannot coexist with the matching rule.** Values are matched as mutually exclusive, so
  the generic value was not a weaker version of the specific ones — it was a rival to
  them. A technician doing exactly what the question asks, counting three holes and then
  six on an iPhone 11, eliminated the iPhone 11 and was shown an iPhone XS. Sixty model
  pairs were in that position.

  The lesson generalises past this attribute: **no value may describe a set of phones
  that another value also describes.** A model that cannot be pinned to a specific value
  belongs absent, not filed under a vaguer one — absence is the mechanism §5.4 already
  provides, and it is the treatment the 🔴 and ⚪ rows get. A test now enforces this
  across the whole schema.

- **`camera_bump_size`** is **relative, not absolute**: `larger` and `smaller` mean larger
  or smaller _than the other models sharing that `rear_camera_layout`_. There is no global
  scale, so a value only means something inside one layout family, and the question is only
  answerable when the two options are drawn side by side to relative scale (§8).

  It is recorded for the six `dual_diagonal_square` models, because that is where it breaks
  a tie: the 13 generation against the 14 and 15. Measured off the committed product shots
  with each body normalised to the same width, so plateau footprint is compared like for
  like. It is **empty on the other 31 models — not because the concept fails there, but
  because nothing needed it.** Several families do differ in bump size across generations;
  they are separated by cheaper attributes, so it was never measured. If a future model
  makes one of those families ambiguous, this is the attribute to extend.

- **`rear_wordmark`** has only two members in practice. The third value once listed here,
  `logo_only_upper`, has no members and was dropped.

### 6.3 Size classes

Judged by **body size**, not screen diagonal — an iPhone 8 Plus has a small
screen in a large body. Three bands, by overall body height:

| Class      | Approx. body height | Character                                     |
| ---------- | ------------------- | --------------------------------------------- |
| `small`    | under ~142 mm       | the minis and the 4.7-inch home-button bodies |
| `standard` | ~142–153 mm         | the default modern size                       |
| `large`    | ~153 mm and up      | Plus and Max bodies, and the iPhone Air       |

The bands are placed **in the gaps in the data**, not on round numbers. Sorted by
height, the 37 bodies fall into three clusters separated by two clear spaces:
138.4 mm (iPhone 8, SE) to 143.6 mm (iPhone X, XS) is 5.2 mm of nothing, and
150.9 mm (XR, 11) to 156.2 mm (iPhone Air) is 5.3 mm of nothing. Every band
boundary sits inside one of those spaces.

**Every model has exactly one size class** (D-28). The class is a fact about the
handset, not a hedge about the judgement: a phone is one size, and the matrix
says which.

Five bands were tried first — `mini`, `compact`, `standard`, `large`, `max` — and
two of their four boundaries were badly placed. The ~135 mm and ~142 mm lines sat
in gaps, as they still do; the ~142 mm one is kept unchanged as today's
`small`/`standard` boundary. But **~150 mm fell in the middle of the densest run
of bodies in the whole set** — 149.6, 149.6, 150.0 and 150.9 mm all sit within
0.9 mm of it, the iPhone 17 Pro exactly on it — and ~156 mm sat 0.2 mm below the
iPhone Air. That put handsets a millimetre or two either side of a line, which no
eye can call, so models carried a second **adjacent** class whenever a model
actually in that class sat within 3 mm.

The hedge then produced the bug it was meant to prevent. **No model recorded
`large` as its own class**: every one of the eight that listed it listed
`standard` too. So `large` was not an alternative to `standard`, it was a strict
subset of it — answering it could only ever eliminate models that answering
`standard` kept, which is the shape D-16 forbids elsewhere in the schema. A
technician picking it narrowed _further_ than the truthful `standard` did: the
iPhone 15 Pro (146.6 mm) dropped out while the 14 Pro (147.5 mm) and 16 Pro
(149.6 mm) survived, on nothing but which side of a 3 mm adjacency each had
landed.

Redrawing the bands onto the gaps (D-27) removed the need for the hedge, and
D-28 removed the hedge. The two go together: dual membership was only ever
tolerable because the boundaries fell where handsets were, and single membership
is only honest because they no longer do. **A future model that lands inside one
of the gaps is a signal to redraw the bands, not to give that model two
classes.** If the bodies ever stop forming clusters that a redraw can separate,
this question has stopped working as a coarse discriminator, and that is the
thing to confront rather than paper over.

What is given up is stated plainly: a body sitting near a boundary would be a
size the technician could call wrongly, and a wrong call now eliminates the right
phone with no second class to catch it. No body sits near one in the sense that
matters. The boundary itself is an abstraction — the iPhone X and XS come within
1.6 mm of the ~142 mm line — but what a technician confuses is a _handset_, and
the nearest handset on the far side of that line is 5.2 mm away. Every model is
at least 5.2 mm from the nearest model in another class, and against the three
silhouettes §8 draws, every one of the 37 is nearest its own — by 4.9 mm in the
closest case.

Two things make the sacrifice smaller than it sounds. On the current set it is
**nil**: with the bands redrawn onto the gaps, the 3 mm adjacency rule would give
every model one class anyway, so D-28 removes a mechanism that has nothing left
to do rather than one that was working. And the technician who genuinely cannot
call it is not forced to guess — "Can't tell" is on every question (D-09) and
eliminates nothing, which is a better escape than a second class, because it
narrows honestly instead of narrowing wrongly. The gaps and that escape together
buy the safety the adjacency rule only pretended to.

Therefore:

- every model lists **exactly one** class, asserted by test;
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

1. Consider only unanswered, unskipped questions the active tier permits. The
   coarse tier permits coarse questions only; **the deep tier is additive** and
   permits both (§4.3, D-17).
2. Score each by **information gain** — the expected reduction in candidate
   count, treating remaining models as equally likely.
3. Break ties by `priority`, so quick whole-hand checks (home button, port,
   camera count) win over checks that need close inspection.
4. Stop when one candidate remains, or no question can further split the set.

The algorithm is deterministic and must be covered by unit tests, including:

- **every model is reachable** — for each model there exists an answer path
  leading to it alone, or to a documented terminal group (§4.4). Phase 1 checked this by
  brute force over every _concrete device_ (one real value per attribute); Phase 2 redid
  it through the real engine and the real question set and found **35 of 37** models
  resolve to exactly one. The test asserts the two groups in §9 and no others, so that a
  data change which creates a third fails the build;
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

The coarse-tier result is **reproduced exactly** by the engine over all 226 concrete
devices the matrix holds today: the same seven groups, no more and no fewer. It is
asserted by test.

The device count is a property of the matrix, not a constant: it is the product of each
model's recorded values, so it moves whenever a model gains or loses one. Phase 2 ran this
check over 288, and D-27 took it to 226 by cutting eight models from two size classes to
one. The seven groups did not move with it. The Phase 2 write-ups below still say 288
because that is the number those runs actually covered — a record of past work is left as
it was, and only claims about the matrix as it stands are restated.

**After both tiers, two groups remain.** 35 of 37 models resolve to exactly one:

| Terminal group       | Situation                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SE (2nd) vs SE (3rd) | Externally identical. Expected; documented from the outset.                                                                                                                                                                                                                                                                                                                                                                                                 |
| iPhone 16 vs 17      | Identical on every attribute in this spec when black or white. Height differs by 2 mm and the display by 0.2 inch — both below what §6.3 says a technician can judge. The 48MP Ultra Wide on the 17 was checked as a possible tell against Apple's product shots and the camera pills are the same. Colour separates them only on the non-shared finishes (16: Pink, Teal, Ultramarine · 17: Mist Blue, Sage, Lavender). **No workbench tiebreaker known.** |

**iPhone 16e vs 17e was on this list and is not any more.** Identical bodies, both notched,
single lens, USB-C, Action button; Soft Pink is the only finish that separates them by
sight. Phase 1 counted it terminal because it scored separability on what the eye can see.
But §4.4 asks for the `magsafe` test precisely because it works on a dead phone, §6.2
records the attribute for all 37 models, and the engine therefore asks it and resolves the
pair. Deny the engine that one attribute and the group comes back — a test asserts both
halves, so the pair's separability cannot quietly regress to resting on colour.

There is no iPhone 17 Plus — the iPhone Air took that slot — so the iPhone 16 Plus has no
equivalent twin at `large` size.

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
§6.3 gained the 3 mm adjacency rule (since removed by D-28), §9 replaced guesswork with
the measured separability result, and scope went from 36 models to 37 (D-01).

**Phase 1 is done.** All 37 models researched and written up; dimensions and size classes
evidence-based; SIM-tray position and `magsafe` verified for every model from Apple's own
tech specs; `flash_position` and `camera_bump_size` read off the committed product shots;
colours enumerated under both naming layers with a closed 14-value palette; the recent
models verified against shipped Apple documentation rather than pre-release reporting.

Across 666 attribute rows: **498 verified, 103 inferred, 31 not applicable, 34 unverified.**
_(Phase 1 recorded 133 inferred and 4 unverified. Phase 2 downgraded the thirty unsourced
`bottom_mic_hole_pattern` rows, which `reference/README.md` had itself flagged as closer to
🔴 than 🟡 — see §6.2.)_

`reference/` carries a fourth flag, ⚪ not applicable, for attributes that have no meaning
on a given model rather than a value nobody found. It exists because the 🔴 count was
misleading: it mixed "could not be sourced" with "there is nothing here to source".

- **31 × ⚪** are `camera_bump_size` outside the `dual_diagonal_square` family. The value
  is relative to a layout family (§6.2), so elsewhere there is nothing to compare against.
  No amount of research fills these.
- **34 × 🔴** are `bottom_mic_hole_pattern` on every model whose bottom edge was not
  photographed. Those phones do have a hole pattern; nobody counted it, because the
  attribute only discriminates inside the X / XS / XS Max group, all three of which are
  photographed. These are the only genuinely unknown values in the set.

One evidence gap remains that is not a flag problem:

- **Bottom edges are unphotographed for 34 of 37 models.** Apple never shoots that edge.
  Only the iPhone X, XS and XS Max are covered, which is the only group it separates.

Neither blocks Phase 2: under §5.4 an absent value eliminates nothing, so an incomplete
matrix degrades to a larger candidate group rather than a wrong answer.

**Phase 2 — data and engine.** Transcribe `reference/` into `src/data/`; build
and unit-test the engine, including the reachability test in §7. _(done)_

**Phase 2 is done.** The matrix, the schema, the question set, the engine and 100 tests.

_The matrix is generated, not typed._ `src/data/models.ts` is produced from
`reference/models/<id>.md` by `npm run transcribe`, and `npm run transcribe:check` — which
CI runs — fails if the committed file has drifted from the evidence layer. D-11 said no
attribute may be written from memory; making the matrix a build output means none can be
(D-14). The flags decide what crosses over: ✅ and 🟡 transcribe, 🔴 and ⚪ are dropped.
That is **601 of the 666 rows** — the 31 ⚪ `camera_bump_size` and 34 🔴
`bottom_mic_hole_pattern` rows are absent rather than guessed, which under §5.4 costs a
larger candidate group and never a wrong answer.

What Phase 2 changed in this spec, all of it from running the real engine over all 288
concrete devices the matrix then held, rather than from re-reading the research (plus one
the transcription surfaced):

- **`(PRODUCT)RED` has no space.** Phase 1 wrote it eleven ways with a space and once
  without. Checked in Phase 2 against the Apple tech-spec pages already cited as the
  source: the odd one out was the correct one. Marketing names never narrow the candidate
  set (D-12), but the reverse-lookup entry displays them (§4.6), so one product reading two
  ways would look like a data error to whoever is checking a phone against it. Both the
  spelling and the general "one marketing name, one spelling" rule are pinned by test.

- **§4.4 and §9: two terminal groups, not three.** iPhone 16e vs 17e resolves on
  `magsafe`, exactly as §4.4 asks it to. Phase 1's count was of _visually_ terminal groups;
  the engine is not limited to sight. 35 of 37 models now resolve alone, not 34.
- **§6.1: `rear_camera_count` earns its place, as a fallback only.** Never chosen while
  the layout question is answerable; the top-scoring question the moment it is not.
- **§9's coarse-tier table is confirmed** — the same seven groups, reproduced by test.

Code review of the Phase 2 branch then found three places where a property this spec
_states_ did not actually hold in code. All three are fixed and pinned by test:

- **§6.2: the `asymmetric` catch-all is gone** (D-16), described above. This was the one
  that could put a wrong model name in front of a technician.
- **§6.4: the `eliminating` flag now works as an escape hatch.** `applyStep` honoured it,
  but the selector scored questions without consulting it — so flipping `colour` to
  non-eliminating left it still chosen as the second question of the flow, now removing
  nothing. A question that cannot eliminate now scores zero gain and is never asked, which
  is what makes the revert a revert.
- **§7's stop condition was inconsistent with itself.** Three places asked "can this
  question split the set?" and two of them used a bare `> 0` where the selector used an
  epsilon. That gap is reachable: `scoreQuestion` sums `1/values.length`, and three equal
  shares do not sum to exactly 1 in IEEE754, so two models with identical six-colour sets
  scored 2.2e-16 on a question that cannot separate them — enough to make the §4.2 result
  screen offer a revisit that provably cannot help. All three now call one `splits` helper.

A second review then found that the `unskip` added for the fourth finding had the same
shape as the rest: a coarse question revived from a deep-tier group screen went back to a
pool the flow would never consult, so the revisit offer did nothing and the question could
not be reached again without starting over. §4.3 and §7 now say the deep tier is additive
(D-17), which is the reading the section already supported. Rewinding `state.tier` in
`unskip` was the obvious alternative and is a trap: `back()` decides the tier by comparing
it against the last step's, so it flips straight back to deep — stranding the question
again, now with no skip step left for the screen to offer. Verified over all 288 concrete
devices the matrix then held that the additive reading changes no outcome and lets no deep
question into the main flow.

Five findings across two reviews, all the same shape: a property this spec states that
nothing checked as a consequence. Both reviews caught them by hand-walking a concrete
device, which does not scale to Phase 3 building buttons on `back`, `unskip`,
`revisitable` and `narrowFurther`. So the flow is now checked mechanically as well —
`invariants.test.ts` walks every state reachable from `startOver()` over a four-model
fixture and pins seven properties at each one: that a revisitable attribute really does
become askable, that _Back_ removes at most one step, that it never undoes two things at
once, that
repeated _Back_ always unwinds to the start, that `asking` and a waiting question are the
same condition, that a settled attribute is never offered twice, and that _Narrow further_
is never offered from the deep tier. Three of the five findings are in that list. It walks
658 states through legal play and 15,374 once the engine API is called freely.

The two walks are the point. **Legal play** acts only on what `resolve` offers, which is
all a UI can do; **free API calls** are what a caller assembling its own `IdentifyState`
can do, which is what Phase 3 restoring a saved session would be. The revisit offer held
under the first reading and not the second: a deep question skipped while on the coarse
tier was named revisitable and could not be reached, because the coarse tier correctly
does not offer deep questions (D-03). `revisitableSkips` now asks `unskip` and reads the
pool it produces, so the offer and the flow that must honour it cannot disagree (D-18).
No path a technician can take changes — all 288 concrete devices then in the matrix land
where they did.

One thing the transcription surfaced that is worth a later look, not blocking:

- Six coarse and deep attributes — `home_button`, `action_button`, `frame_material_finish`,
  `back_glass_finish`, `flash_position`, `lidar` — are never the best question on any
  device, being subsumed by cheaper ones. They still earn their keep as "Can't tell"
  fallbacks and as the reverse-lookup entry's content (§4.6), so none was removed.

**Phase 3 — identify UI.** Question flow, can't-tell, back/start-over, answer
trail, result and group screens. _(done)_

**Phase 3 is done.** Five screens over one piece of React state — the engine's
`IdentifyState` — with every screen a pure function of it, because `resolve()`
already derives what each one needs. Nothing about the flow is decided in the UI;
`App.tsx` routes on `status` and wires the engine's own actions to buttons.

_The wording is the part that can be wrong._ The components are thin enough to
read, but a sentence naming what separates two candidates cannot be checked by
the technician it misleads. So the sentences live in `ui/presenters.ts` as pure
functions and are tested against the real matrix under the existing `node` test
environment — no DOM harness, no new dependencies.

What Phase 3 changed in this spec, from walking the built app rather than from
re-reading §4:

- **§4.4's plain statement and §4.2's revisit offer can contradict each other,
  and did.** Answering down to iPhone 16 vs 17 with colour skipped reaches
  `ambiguous` — nothing left to _ask_ — and the screen printed "no characteristic
  recorded here distinguishes them" directly above an offer to revisit colour,
  which §9 says separates that pair on the finishes they do not share. Nothing
  left to ask is not the same as nothing left to know. The terminal statement is
  now suppressed while any skip could still split the group, and the two are
  pinned as mutually exclusive by test (D-19).
- **Hiding dead options makes `contradictory` unreachable.** Offering only values
  some candidate records means an answer always keeps that candidate, so the set
  cannot empty by tapping. The status stays in the engine and the screen stays in
  the UI as the floor under that property, not as a screen the flow visits.

Two things Phase 3 deliberately did not build, both belonging to later phases:

- **Diagrams.** `QuestionScreen` carries the slot and the `option.diagram` id;
  Phase 4 fills it. One deep question already asks for a picture in its own help
  text — `camera_bump_size` says to answer it "only with the two outlines drawn
  side by side" — so it is answerable but not yet properly askable. _(Phase 4
  filled both.)_
- **The reverse-lookup link** §4.5 asks for. Phase 5 builds the entry; the result
  screen names the model it will open rather than carrying a dead link. _(Phase 5
  replaced the placeholder with the link.)_

**Phase 4 — diagrams.** Draw the SVG set; wire into questions and reverse
lookup. _(done)_

**Phase 4 is done.** Thirty-one hand-drawn SVG components across the seven
questions that declared a `diagram` id, plus the registry binding ids to
components and the slot in `QuestionScreen`. `questions.ts` still knows nothing
about React: it names diagrams, `src/diagrams/registry.ts` resolves them, and a
test asserts the two agree in both directions so neither a missing drawing nor an
orphaned one can pass CI.

Wiring into reverse lookup is the half that does not exist yet, because reverse
lookup does not (Phase 5). _(Phase 5 wired it: an entry renders the same
components against the same ids, so the set had nothing added to it.)_

What Phase 4 changed in this spec, all of it from drawing against the committed
reference images rather than from re-reading §8:

- **One square viewBox for everything was wrong.** §8 asks for drawings legible
  at roughly 120 px, and a square frame spent two thirds of every camera diagram
  on blank back glass — the housing, which is the whole content, came out around
  30 px. Each family now gets the frame that fits it: a wide crop of the phone's
  top for the camera and cutout questions, a tall one for `rear_wordmark`, a
  landscape strip for `bottom_mic_hole_pattern`, a square for the size
  silhouettes. §8's requirement is that options **within a question** be
  comparable, and one viewBox per family is what delivers that.
- **`single_lens_flash_beside`'s label was wrong, and its own reference file said
  so.** The label read "One lens on the glass, flash directly below it". The
  layout row in `reference/models/iphone-8.md` is marked 🟡 inferred and carries
  the instruction "confirm against a reference image", while the `flash_position`
  row two tables down is ✅ verified as "to the right of the lens on the bare
  glass, level with it, past the mic hole", read off the committed product shot.
  The iPhone 8, SE 2 and SE 3 all read the same way. Drawing the diagram is what
  performed the confirmation the reference file asked for, so the label now
  matches the photograph. Phase 4 left the **value name** alone (D-21); the
  data pass that followed renamed it (D-22).
- **Correcting it collides two options.** With the flash beside the lens on both,
  `single_lens_flash_beside` (8, SE) and `single_lens_no_housing` (16e, 17e)
  describe the same arrangement, and separate only on how large the lens is. The
  labels and the two drawings now carry that difference, and the question's help
  text says to compare against the drawings rather than from memory. This costs
  the engine nothing — both groups are separated several times over by
  `home_button`, `port` and `front_cutout` — but it is a question a technician
  can now answer wrongly where before they could not answer it at all.
- **The camera-bump comparison is measured, and much smaller than it reads.**
  The committed product shots are all square on — the back panel's left edge
  holds the same x to within 4 px down its whole straight run — so the housings
  can be measured directly. Body width in pixels comes from body height and the
  millimetre dimensions in `reference/matrix.md`, and is confirmed against the
  panel's own right edge, which lands within 2 px.

  | Model          | Housing width | Outer lens | Value     |
  | -------------- | ------------- | ---------- | --------- |
  | iPhone 13      | 29.5 mm       | ~13.5 mm   | `smaller` |
  | iPhone 13 mini | 28.9 mm       | ~13.9 mm   | `smaller` |
  | iPhone 14      | 30.7 mm       | ~15.8 mm   | `larger`  |
  | iPhone 14 Plus | 30.7 mm       | ~15.9 mm   | `larger`  |
  | iPhone 15      | 31.6 mm       | ~15.9 mm   | `larger`  |
  | iPhone 15 Plus | 31.7 mm       | ~15.9 mm   | `larger`  |

  The 14 figure is independently confirmed: the 14 and the 14 Plus are different
  images at different body widths and land on the same 30.7 mm. Lens figures are
  softer, because a lens rim gives several concentric edges.

  **The housings differ by about 2 mm in 30 — 7%.** That is far less than a
  schematic drawing naturally suggests, and an earlier draft of these diagrams
  overstated it roughly fourfold. They are now drawn to the measured ratio, and
  render larger than the rest of the set because the honest ratio needs the room.
  The **lenses** are the better cue at about 18%, so the drawings lean on lens
  size and the help text says so outright, along with an invitation to answer
  "Can't tell" — which rules nothing out.

**Between Phases 4 and 5 — a data pass.** Phase 4 ended holding three open
questions it could not settle from a UI branch. All three are now decided and
recorded as D-22, D-23 and D-24.

The one with teeth was the rename. `single_lens_flash_below` named a flash
position no model has, and Phase 4 could correct the label but not the value:
under D-11 the matrix is generated from `reference/`, so the name lives in the
evidence layer and changing it is a data change. It is now
`single_lens_flash_beside` in all three reference files, in `matrix.md`, in the
attribute set, in the question, in the diagram id and component, and in the
regenerated matrix. Renaming one value uniformly partitions the candidate set
exactly as before, so no separability result moves — the existing tests hold
unchanged, which is the evidence for that claim rather than a re-run of §7.

The three reference rows also stop asking for a confirmation that has already
happened. They were 🟡 inferred carrying the instruction "confirm against a
reference image"; drawing the diagram in Phase 4 performed it, so they are now
✅ verified against the committed product shot, cited as that model's image
source. The flag change alters nothing downstream — 🟡 and ✅ both transcribe.

**Phase 5 — reverse lookup.** Browsable model list and detail view. _(done)_

**Phase 5 is done.** A list of all 37 models grouped by release year, and an
entry per model showing every characteristic the matrix records for it, carrying
the same diagram components the questions use — so confirming a result is
comparing the phone against the pictures it was just asked about rather than
against a second vocabulary for the same features. The result screen's
placeholder is now the link §4.5 asked for, and the list is reachable from
anywhere in the flow, because two of §4.6's three jobs — training, and reviewing
the data — are not things a technician arrives at by identifying a phone first.

The shape follows Phase 3's: the components are thin, and everything that could
be _wrong_ rather than merely ugly is a pure function in `ui/lookup.ts`, tested
against the real matrix over all 37 models rather than a fixture.

What Phase 5 changed in this spec, from building the view rather than from
re-reading §4.6:

- **A blank row is a row, not an omission.** 65 of the 666 rows are absent by
  design (§10, Phase 2), and an entry that quietly listed 16 characteristics for
  one model and 18 for another would read as a bug in whichever one the
  technician saw second. Every attribute gets a row; an absent one says so and
  says what it costs — under §5.4 a value the matrix does not record eliminates
  nothing (D-26). The screen cannot do better than that, and should not pretend
  to: 🔴 unverified and ⚪ not applicable both transcribe to absence, so nothing
  downstream can tell "nobody counted the holes" from "there is nothing here to
  count".

- **The two colour layers are not one-to-one in either direction**, and both
  directions are in the data. Two marketing names under one palette value is the
  expected case §6.5 already describes — the iPhone 15 Pro's Natural Titanium
  and White Titanium are both `white_silver`. The reverse is not described
  there and is real: the iPhone 13 and 13 mini record "Blue" as **both**
  `light_blue` and `dark_blue`, which `reference/models/iphone-13.md` calls a
  boundary shade — carrying both values is how a shade sitting between two
  palette entries is recorded so that neither answer eliminates the model. On
  screen that reads as the same colour listed twice by mistake, so the entry
  explains it, derived from the data rather than named in the code.

- **Row order is `attributes.ts` order, which is the reference files' order.**
  §4.6 names reviewing and correcting the underlying data as one of this view's
  jobs, and that job is reading the entry beside `reference/models/<id>.md`. The
  two now read in the same sequence, so a discrepancy shows up level with
  itself. The entry also names that file, which is the whole of what D-24 leaves
  a technician to do about a wrong value.

- **The view lives in the URL, the run does not** (D-25). §2 puts this on a
  phone at a workbench, where the system Back button is the back button; a view
  held in React state makes it leave the app. So the hash carries which screen
  is showing and nothing else, which is also what makes the §4.5 link safe —
  looking a model up mid-run and coming back leaves the answer trail exactly
  where it was, because navigating never touched it.

Phases 1 and 2 are strictly ordered. No model attribute may be written into
`src/data/models.ts` from memory — it must trace to `reference/`.

## 11. Decisions log

| #    | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Coverage is iPhone 8 → iPhone 17e, including iPhone Air, 16e, and both SE generations. Extended from 36 to 37 models during Phase 1 when the iPhone 17e shipped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| D-02 | Attribute matrix with dynamic question selection, not a hand-authored decision tree. Adding a model is one data row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| D-03 | Coarse questions by default; micro-detail questions behind an explicit "Narrow further" step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| D-04 | Vite + React + TypeScript, static build, offline-capable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| D-05 | Hand-drawn SVG schematics rather than photographs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| D-06 | Result screen shows the model name only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| D-07 | Both US and international body variants are in scope; SIM-tray presence is a real discriminator.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| D-08 | Colour is a normal eliminating question, with rehousing caveats and an escape hatch (§6.4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| D-09 | "Can't tell" on every question; the engine routes around unavailable attributes and never eliminates on missing data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| D-10 | Size is expressed as body-size classes, never as measurements. The count was five until D-27 cut it to three, and the overlap this decision allowed was removed by D-28.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| D-11 | Data verification (Phase 1) happens before any matrix authoring, in its own session, and everything is sourced. No model attribute may be written from memory — it must trace to `reference/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| D-12 | Colours carry both an Apple marketing name and a plain descriptive palette value. The engine matches on the descriptive value only (§6.5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| D-13 | Phase 1 reference images are committed to the repo, not kept local. They are never imported into the build.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| D-14 | `src/data/models.ts` is generated from `reference/models/` by `npm run transcribe`, not hand-written, and CI fails if the two drift. D-11 becomes a build rule rather than a discipline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| D-15 | The engine may use any recorded attribute to separate models, including ones that need an accessory rather than an eye (`magsafe`). Terminal ambiguity means the _matrix_ cannot separate them, not that sight cannot.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| D-16 | No attribute may carry a catch-all value covering models that a specific value also covers. §5.4 matches values as mutually exclusive, so a catch-all is a rival to the specific values, not a weaker form of them: a truthful specific answer eliminates every model filed under the generic one. A model that cannot be pinned to a specific value is recorded **absent**. Enforced by test across the whole schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| D-17 | The deep tier is **additive**: it adds deep questions rather than hiding coarse ones. §4.3 constrains deep questions only, so `tier` records how far the technician has agreed to go, not which questions can be reached. Keeping it out of reachability is what lets `unskip` revive a coarse question without rewinding the tier — and `back()` would flip a rewound tier straight back, stranding the question again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| D-18 | The §4.2 revisit offer names only skips the flow can honour: the question must still split the candidates **and** be one the current tier would offer. `revisitableSkips` decides the second half by running `unskip` and reading the resulting pool, rather than re-testing the tier itself, so the offer and the flow cannot drift apart. Unreachable through play — a UI can only skip what it was asked — and one call away for a caller that assembles its own `IdentifyState`, which Phase 3 will when restoring a session.                                                                                                                                                                                                                                                                                                                                                                                    |
| D-19 | §4.4's "no visible characteristic distinguishes them" is claimed only when **nothing** can split the group, not merely when nothing is left to ask. A run that skipped an attribute reaches the same `ambiguous` status with that attribute still able to separate the candidates, and stating it there contradicts the §4.2 offer to revisit printed underneath. The statement is suppressed whenever a skip is revisitable; the offer speaks instead. The two are mutually exclusive by test.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| D-20 | Diagrams never redraw a manufacturer's mark. §8 chose hand-drawn SVG partly to keep the app clear of artwork that is not ours, and reproducing the Apple logo walks straight back into it. `rear_wordmark` draws the mark as a plain roundel: the question asks **where** the mark sits and whether a word is under it, and a technician looking at the back already knows its shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| D-21 | An option **label** may be corrected against a reference image without touching the attribute **value** it labels. Labels are display text; values are matrix data under D-11 and renaming one is a change to `reference/`, the transcription and the separability check. Phase 4 corrected a label the reference file itself flagged for confirmation, and left the value it names for a deliberate data pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| D-22 | Attribute **values** are named for what the technician sees, and a value whose name contradicts the reference images is renamed rather than left as a label-only correction. `single_lens_flash_below` became `single_lens_flash_beside` in a data pass: the three models carrying it put the flash beside the lens, not below it. Safe by construction — renaming one value uniformly re-labels a partition without changing it, so no separability result moves. The alternative, merging it into `single_lens_no_housing`, was declined: it drops a value from the matrix and asks whether lens size is a fair thing to put to a technician, which is a bigger question than the name.                                                                                                                                                                                                                            |
| D-23 | `camera_bump_size` stays **eliminating** and gains a caveat on its option rows. Phase 4 measured the judgement it asks for at about 2 mm in 30 — close to the limit of what an eye can call against a drawing — but it is the only thing separating the iPhone 13 from the 14 once the coarse tier is exhausted, so removing its power to eliminate would give that pair up entirely. Mitigation is honesty at the point of the tap: the help text states the real magnitude and the rows carry the "Can't tell" escape hatch, which rules nothing out.                                                                                                                                                                                                                                                                                                                                                              |
| D-24 | Reverse lookup is **read-only**. Correcting a model attribute is a change to `reference/models/<id>.md` followed by `npm run transcribe`, never an edit in the app. In-app editing would put a value into the matrix that no source backs, which is the one thing D-11 exists to prevent, and the matrix is a build output under D-14 with nowhere to write back to. §4.6's "review and correct" is the review half in the app and the correction half in the repo.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| D-25 | Which view is showing lives in the **URL hash**; the identify run lives in React state, and the two never mix. §2 puts this on a phone at a workbench, where the system Back button is the back button — a view held in state makes it leave the app, and one held in the hash steps back through the entry, the list and the flow. The run is deliberately not addressable: it is an answer trail and a tier, and a bookmark of it would be a half-finished diagnosis. That separation is what lets the §4.5 link open a model mid-run and come back to the trail intact. Hand-rolled, not a router: §5.1 asks for a concrete need and three parameterless routes are not one.                                                                                                                                                                                                                                      |
| D-26 | An attribute the matrix does not record gets a row **saying so**, never an omitted row. 65 of the 666 rows are absent by design, and an entry listing 16 characteristics for one model and 18 for another reads as a bug rather than as sparse data. The row states the consequence — under §5.4 an absent value eliminates nothing — because that is the whole of what is knowable: 🔴 unverified and ⚪ not applicable both transcribe to absence, so no screen can tell "nobody counted" from "there is nothing to count".                                                                                                                                                                                                                                                                                                                                                                                        |
| D-27 | `body_size_class` has **three** bands — `small` · `standard` · `large` — placed in the gaps between the clusters the 37 bodies actually form, replacing the five of D-10. The fourth of the old five had no members of its own: no model was `large` alone, so the option existed only as an adjacency from `standard`, and picking it narrowed _further_ than the truthful answer did (§6.3). A band no model lives in is not a size a phone can be. Redrawing onto the gaps left the 3 mm adjacency rule with nothing to do, every model carrying exactly one class; D-28 then removed the rule outright and made that the requirement.                                                                                                                                                                                                                                                                            |
| D-28 | A model has **exactly one** `body_size_class`. D-10 let a model list two adjacent classes, as a hedge against a judgement no eye can make: under the five-band scheme the boundaries fell where handsets were, so a body could sit 2 mm from the line. The hedge caused the failure it existed to prevent — the empty band of D-27 was reachable _only_ as an adjacency, and answering it eliminated a model the truthful answer kept. D-27 moved the boundaries into the 5 mm gaps between the clusters the bodies form, which is what makes a definitive class honest: every model is at least 5.2 mm from the nearest model in another class, so there is no borderline call left to hedge. A future model landing in a gap is a signal to redraw the bands, never to give it two classes; if no redraw separates the clusters, the question has stopped working and that is the thing to face. Asserted by test. |
| D-29 | The app is packaged for the desktop with **Tauri**, targeting **Windows** first and macOS and Linux where they come free. Tauri wraps the same `dist/` the web build produces and holds no logic of its own — the shell opens a window and nothing else, so the web build stays first-class and the engine stays testable without a UI (§5.5). Electron was not weighed against it on bundle size but on this: Tauri uses the OS webview, so packaging adds a shell rather than a second browser, and "the desktop app" and "the page on the shop network" stay the same program. Building and releasing are separate triggers, so an installer can be produced without publishing one.                                                                                                                                                                                                                              |

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

- How the built app is served at the shop — copied to each device, or served
  from one machine on the LAN. **Partly settled by D-29**: on a bench PC it is
  an installer, and the question no longer has to be answered for that case.
  It stays open for the phones and tablets §2 describes, which the desktop
  build does not reach.
- Where reference images come from, and under what terms. Press images and
  product shots are the practical source but are not ours to redistribute.
  Since the repo is internal and the images are drawing references that never
  ship in the build, this is low risk — but if the repo ever goes public it
  needs revisiting. _Record the source URL for each image in
  `reference/models/<id>.md` so this stays traceable._
- **A candidate strip along the top of the identify flow**, showing all 37
  models and dimming each as it is eliminated. Raised after Phase 3; deferred
  rather than declined, and worth splitting in two because the halves cost very
  different things.

  The **narrowing** half **has shipped** — `CandidateStrip.tsx`, on the question
  and group screens. It was cheap and already sanctioned: §4.1 step 3 asks for a
  live count, and a row of model names that dims is that count made legible. It
  needed no new assets. Three things settled in the building, recorded here
  because they are what the rest of this bullet turns on:

  - **It replaces the count sentence rather than joining it.** "12 of 37 models
    match" and a strip showing twelve lit chips are one fact printed twice, and
    the strip is the one that also says _which_ twelve. The sentence stays as
    the strip's accessible summary, in a live region, because thirty-seven names
    re-read on every answer is noise: the chips are `aria-hidden` and the count
    §4.1 asks for is announced once, in words.
  - **The chips are not buttons.** Nothing on the strip is clickable and nothing
    on it claims which survivor the phone is — the softer tension below decided
    this, not styling. It is a readout.
  - **Names are shortened, never invented.** Every name in the matrix opens with
    "iPhone", so the chips drop it (and "generation" from the two SE names) to
    buy the width that separates "13 Pro" from "13 Pro Max". A test asserts the
    37 shortened names stay distinct, since two chips reading alike would show
    one model out and another in under the same word.

  The **pictures** half remains deferred, for three reasons:

  - **It would ship the reference images.** The 37 shots in
    `reference/images/apple/` are Apple's product shots, and the bullet above
    calls redistribution low risk _because_ D-13 and §8 keep them out of the
    build. A picture strip reverses that, on every device the app is copied to.
    That is a decision to take deliberately, not as a side effect of a UI change.
  - **Nothing planned draws models.** §8 draws one SVG per _answer option_ —
    layouts, cutouts, size silhouettes. Per-model artwork is 37 drawings the
    plan does not otherwise call for.
  - **It is weakest where it is needed most.** 35 of 37 models resolve alone
    (§9), so on most runs the strip is decoration that empties out. It earns its
    keep on the group screens — and those are the pairs §9 records as identical
    on every attribute here. Their pictures would be indistinguishable: Phase 4
    measured the 13/14 camera housings at 29.5 mm against 30.7 mm, a 7%
    difference on a part that is itself a fifth of the body (§10).

  There is also a softer tension, which the shipped half has now had to answer:
  prompts deliberately describe what is in the technician's hand and never which
  model it might be (`questions.ts`). A standing wall of model photos invites
  matching the phone against pictures instead of answering the question, which
  is the failure mode §1 opens with. The strip is therefore built as a _readout_
  of narrowing and not a lookup surface — small chips, no tap targets, no
  claim about which one it is — and a picture strip would pull hard the other
  way, because a photograph is a thing to match against in a way a name is not.

  _Leaning: revisit after Phase 5, when reverse lookup has settled what a
  per-model visual is and the image question above has an answer._
