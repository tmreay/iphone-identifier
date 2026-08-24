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
src/ui/          screens, and the display text they derive (presenters.ts,
                 lookup.ts) plus the hash routing between them (route.ts)
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

**All five phases are complete**: scaffolding, sourced data collection, the
matrix plus the identification engine, the identify UI, the diagrams, and
reverse lookup. See SPEC.md §10.

The app runs end to end. It asks questions, illustrated where a picture is what
the technician needs, narrows the candidate set, and reaches a model, a group,
or a stated terminal ambiguity — and from the result, or from anywhere in the
flow, opens the reverse-lookup entry listing every characteristic the matrix
records for a model, drawn with the same diagrams the questions used.

Reverse lookup is read-only by decision (SPEC.md D-24). Correcting a value means
editing `reference/models/<id>.md` and re-running `npm run transcribe`; each
entry names its own file so the fix is one step from the wrong row.

A data pass between Phases 4 and 5 settled the three questions Phase 4 left
open (SPEC.md D-22 to D-24):

- The attribute value `single_lens_flash_below` named a flash position none of
  the three models carrying it actually has. It is now
  `single_lens_flash_beside`, renamed through `reference/` and regenerated, and
  those three rows are verified against the product shots rather than inferred.
- `camera_bump_size` stays eliminating — it is the only thing separating the
  iPhone 13 from the 14 — and its option rows now carry the measured magnitude
  and the "Can't tell" escape hatch.
- Reverse lookup will be read-only. Correcting a model attribute means editing
  `reference/models/<id>.md` and re-running `npm run transcribe`.
