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
src/diagrams/    hand-drawn SVG illustrating answer options, and the id registry
src/ui/          screens, and the display text they derive (presenters.ts)
```

## The matrix is generated

`src/data/models.ts` is not hand-written. It is transcribed from
`reference/models/<id>.md` by `npm run transcribe`, so every value in it traces
to a cited source (SPEC.md D-11). Edit the reference file, then regenerate —
CI fails if the two drift apart.

## The diagrams are drawn, not photographed

Every answer option that describes a shape, layout or position carries a
hand-drawn SVG (SPEC.md §8): schematic, two colours, and drawn from the product
shots committed under `reference/images/`. Those photographs are the drawing
source and are never imported by the build, so the shipped app contains SVG only.

`questions.ts` names each diagram by a stable id and knows nothing about React;
`src/diagrams/registry.ts` binds ids to components, and a test asserts the two
agree in both directions — a declared id with no drawing, or a drawing nothing
declares, fails CI.

## Status

Phases 0-4 complete: scaffolding, sourced data collection, the matrix plus the
identification engine, the identify UI, and the diagrams. The app runs end to
end — it asks questions, illustrated where a picture is what the technician
needs, narrows the candidate set, and reaches a model, a group, or a stated
terminal ambiguity.

Phase 5 (reverse lookup) is next; see SPEC.md §10. Two things wait on it:

- The result screen names the model's reverse-lookup entry instead of linking
  to it.
- §8 asks for the diagrams to be wired into reverse lookup as well as into the
  questions. Half of that shipped with Phase 4; the other half needs the view.

One thing Phase 4 turned up and did not settle: `single_lens_flash_below` is an
attribute value named for a flash position none of the three models carrying it
actually has. The option label is corrected; the value name is a data change, and
SPEC.md §12 records the two ways to take it.
