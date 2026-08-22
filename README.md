# iPhone Identifier

A local web app that walks a repair technician through questions about a
phone's visible characteristics until it identifies the iPhone model on the
bench. Covers iPhone 8 through the iPhone 17 generation.

Full requirements, data model, and roadmap: **[SPEC.md](SPEC.md)**.

## Requirements

Node 20.19+ (developed on 22.20.0).

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Vite serves on all interfaces, so the dev server is reachable from a phone or
tablet on the same network.

## Scripts

| Command              | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload                                    |
| `npm run build`      | Type-check and build to `dist/`                               |
| `npm run preview`    | Serve the production build locally                            |
| `npm test`           | Run the Vitest suite once                                     |
| `npm run test:watch` | Vitest in watch mode                                          |
| `npm run typecheck`  | Type-check without emitting                                   |
| `npm run lint`       | ESLint                                                        |
| `npm run lint:fix`   | ESLint, fixing what it can                                    |
| `npm run format`     | Prettier, writing in place                                    |
| `npm run transcribe` | Regenerate `src/data/models.ts` from `reference/`             |
| `npm run ci`         | Everything CI runs: format, lint, types, transcription, tests |

The build uses relative asset paths, so `dist/` can be copied to a device and
opened directly. The app has no backend and no runtime network dependency.

## Layout

```
SPEC.md          the specification — read this first
reference/       Phase 1 research output: sourced model facts and images
scripts/         build tooling — the reference/ -> src/data/ transcription
src/data/        attribute definitions, questions, the model matrix
src/engine/      pure TypeScript identification logic (no React)
src/diagrams/    SVG components illustrating answer options (Phase 4 — empty)
src/ui/          screens, and the display text they derive (presenters.ts)
```

## The matrix is generated

`src/data/models.ts` is not hand-written. It is transcribed from
`reference/models/<id>.md` by `npm run transcribe`, so every value in it traces
to a cited source (SPEC.md D-11). Edit the reference file, then regenerate —
CI fails if the two drift apart.

## Status

Phases 0-3 complete: scaffolding, sourced data collection, the matrix plus the
identification engine, and the identify UI. The app runs end to end — it asks
questions, narrows the candidate set, and reaches a model, a group, or a stated
terminal ambiguity.

Phase 4 (the SVG diagrams) is next; see SPEC.md §10. Two things wait on it:

- Questions are text-only. `src/diagrams/` is empty, and one deep-tier question
  — `camera_bump_size`, which separates the iPhone 13 from the 14 — asks in its
  own help text to be answered against two outlines drawn side by side. It is
  answerable today, but not properly askable.
- The result screen names the model's reverse-lookup entry instead of linking
  to it. Reverse lookup is Phase 5.
