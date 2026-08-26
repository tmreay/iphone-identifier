# Changelog

## v1.1.0 — 2026-08-26

- **A breadcrumb on every screen**, saying where in the identification the app
  is: the question being asked and what it asks about, the deep tier once
  _Narrow further_ has been taken, the model a run resolved to. A model entry
  hangs off wherever it was opened from — the browsable list, or the run, which
  is still exactly where it was, and stays in the trail while you browse. The
  root is always a fresh identification, so the next phone on the bench is one
  tap away from anywhere — and it offers to discard a run only when there is one
  to discard (SPEC.md §4.7, D-32).

## v1.0.0 — 2026-08-26

The first release. Everything the specification asks for is built: identify,
narrow further, reverse lookup, and a desktop app to run it all on a bench PC.

### Identification

- **Guided question flow** over all 37 models, iPhone 8 through iPhone 17e. The
  app asks the single most useful question for the candidates still standing,
  and stops as soon as one model is left.
- **Can't tell / not visible** on every question. It eliminates nothing and
  moves on, and the app remembers what was skipped — if two candidates differ
  only by something skipped, the result says so and offers to go back to it.
- **Narrow further**, a deep tier of close-inspection questions — mic-hole
  patterns, rear logo and wordmark, camera bump proportions, flash placement,
  MagSafe — offered only when the ordinary questions run out with more than one
  model left.
- **Terminal ambiguity is stated, not guessed.** Where two models cannot be told
  apart by looking at them, the app names the pair and says why, and suggests a
  non-visual tiebreaker where one exists.
- **Back, start over, and a visible answer trail**, so a wrong answer can be
  spotted and corrected rather than restarted around.
- **A live candidate strip**, collapsed to a count and expandable into every
  model name, dimming each as it goes out. The count is announced to assistive
  technology on every change.

### Reference and reverse lookup

- **A browsable list of all 37 models**, grouped by release year, reachable from
  anywhere in the flow — for training, for confirming a result, and for
  reviewing the underlying data.
- **A detail entry per model** showing every characteristic the matrix records,
  drawn with the same diagrams the questions use. Looking a model up mid-run
  never disturbs the run.
- **Product photographs** on the result screen, on a shortlist of four or fewer,
  and on a lookup entry — where the app is showing rather than asking.
- **Hand-drawn SVG diagrams** for every answer option, so a question is answered
  by comparing shapes rather than by recognising a phone.

### Data

- **Every model attribute traces to a source.** `src/data/models.ts` is
  generated from the researched files in `reference/`, and CI fails if the two
  have drifted.
- **A tested engine**, kept free of React, including a brute-force check that
  every model is reachable by some run of questions.

### Running it

- **Offline, with no backend.** The build is a static bundle that can be copied
  to a device and opened directly.
- **A desktop app** built with Tauri, for Windows, macOS and Linux — shipped as
  a single-file portable `.exe` and an MSI for deployment, plus `.dmg`,
  `.AppImage` and `.deb`.
