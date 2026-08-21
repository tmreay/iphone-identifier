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
src/diagrams/    SVG components illustrating answer options
src/ui/          screens
```

## The matrix is generated

`src/data/models.ts` is not hand-written. It is transcribed from
`reference/models/<id>.md` by `npm run transcribe`, so every value in it traces
to a cited source (SPEC.md D-11). Edit the reference file, then regenerate —
CI fails if the two drift apart.

## Status

Phases 0-2 complete: scaffolding, sourced data collection, and the matrix plus
the identification engine. Phase 3 (the identify UI) is next; see SPEC.md §10.
