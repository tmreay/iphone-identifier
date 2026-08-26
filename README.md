# iPhone Identifier

A local web app that walks a repair technician through questions about a
phone's visible characteristics until it identifies the iPhone model on the
bench. Covers iPhone 8 through the iPhone 17 generation.

Full requirements, data model, and roadmap: **[SPEC.md](SPEC.md)**.

## Requirements

Node 20.19+ (developed on 22.20.0).

Building the **desktop app** additionally needs a Rust toolchain and your
platform's C toolchain — see [Desktop builds](#desktop-builds). Nothing else in
this repo needs Rust, and neither does the web build.

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

| Command                 | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                                    |
| `npm run build`         | Type-check and build to `dist/`                               |
| `npm run preview`       | Serve the production build locally                            |
| `npm run desktop`       | Run the app in a desktop window, with hot reload              |
| `npm run desktop:build` | Build the desktop app and installer for the current platform  |
| `npm run icon`          | Redraw the app icon and derive the platform set               |
| `npm test`              | Run the Vitest suite once                                     |
| `npm run test:watch`    | Vitest in watch mode                                          |
| `npm run typecheck`     | Type-check without emitting                                   |
| `npm run lint`          | ESLint                                                        |
| `npm run lint:fix`      | ESLint, fixing what it can                                    |
| `npm run format`        | Prettier, writing in place                                    |
| `npm run transcribe`    | Regenerate `src/data/models.ts` from `reference/`             |
| `npm run ci`            | Everything CI runs: format, lint, types, transcription, tests |

The build uses relative asset paths, so `dist/` can be copied to a device and
opened directly. The app has no backend and no runtime network dependency.

## Layout

```
SPEC.md          the specification — read this first
reference/       Phase 1 research output: sourced model facts and images
scripts/         build tooling — the transcription, and the icon generator
src-tauri/       the desktop shell — window config and icons, no logic
src/data/        attribute definitions, questions, the model matrix
src/engine/      pure TypeScript identification logic (no React)
src/diagrams/    hand-drawn SVG illustrating answer options, and the id registry
src/ui/          screens, the breadcrumb over them, and the display text they
                 derive (presenters.ts, lookup.ts) plus the hash routing
                 between them (route.ts)
```

## Getting it onto a Windows PC

Two files, for two different jobs:

| File                                            | What to do with it                                         |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `iPhone Identifier_<version>_x64_portable.exe`  | Copy it to the bench PC and run it. No install.            |
| `iPhone Identifier_<version>_x64_installer.msi` | For deploying across machines, via script or group policy. |

**The portable one is the app.** Tauri compiles the frontend into the binary, so
that single ~3 MB file is the whole program — put it on a USB stick, a shared
folder, or the desktop, and double-click. Nothing is installed, so there is no
Start Menu entry and no uninstaller, and updating means replacing the file.

It is not quite zero-footprint: the WebView2 runtime keeps a profile for the app
under `%LOCALAPPDATA%\info.thomasreay.iphone-identifier\` (a few MB), which is
why a half-finished identification is still there next time you open it. Delete
that folder as well if you want the machine genuinely clean.

**The MSI installs it properly**, and is the one to reach for when a machine
should have the app registered like any other software. It installs per-machine,
so it needs administrator rights — which is the trade for it being deployable
without anyone sitting at the keyboard.

Where to get them:

- **From a release** — the draft release a `v*` tag opens carries them.
- **From a build** — run the [Desktop workflow](.github/workflows/desktop.yml)
  by hand. Each file is its own artifact, named after itself, and downloads as
  that file rather than a zip.
- **From this machine** — `npm run desktop:build`. The portable binary is
  `src-tauri/target/release/iphone-identifier.exe`; the MSI is under
  `src-tauri/target/release/bundle/msi/`.

Neither is signed, so SmartScreen asks once — _More info_ → _Run anyway_.

## Desktop builds

The app installs as a desktop application via [Tauri](https://tauri.app)
(SPEC.md §5.5, D-29). **Windows is the target that matters**; macOS and Linux
bundles are built alongside and are welcome, but are not what the shop runs.

Tauri wraps the **same `dist/` the web build produces**. `src-tauri/` contains
no application logic — one Rust file whose only statement opens a window, and no
Tauri API calls from the frontend — so the web build stays first-class and the
engine stays testable without a UI.

To build locally you need a Rust toolchain plus your platform's C toolchain:

- **Windows** — [Rust](https://rustup.rs) and the Visual Studio Build Tools with
  the "Desktop development with C++" workload. Rust on Windows links through
  MSVC, so `cargo` alone is not enough.
- **macOS** — Rust and the Xcode command line tools (`xcode-select --install`).
- **Linux** — Rust plus `libwebkit2gtk-4.1-dev`, `librsvg2-dev`, `libxdo-dev`,
  `libayatana-appindicator3-dev`, `patchelf` and `build-essential`. The
  [desktop workflow](.github/workflows/desktop.yml) lists the full set.

Then:

```bash
npm run desktop:build
```

On Windows that writes the portable binary to
`src-tauri/target/release/iphone-identifier.exe` and the MSI under
`src-tauri/target/release/bundle/msi/`; other platforms get their bundles under
`bundle/`. `npm run desktop` runs the app in a window against the Vite dev
server, with hot reload.

The one thing neither Windows file carries is the **WebView2 runtime**, which
Windows 10 1803+ and Windows 11 ship. The MSI fetches it when it is missing
rather than embedding ~130 MB in every copy; the portable exe cannot fetch
anything, so it simply needs a machine that already has it — every current
Windows does. Running the app never touches the network either way.

## Releases are separate from builds

[`.github/workflows/desktop.yml`](.github/workflows/desktop.yml) builds the
bundles. Two ways in:

| Trigger         | Builds                   | Publishes                  |
| --------------- | ------------------------ | -------------------------- |
| Push a `v*` tag | Windows, macOS, Linux    | A **draft** GitHub release |
| Run it by hand  | Windows, or all if asked | Only if you tick `release` |

A manual run that does not publish leaves the installers as downloadable
workflow artifacts, so you can get a build without cutting a release.

**One artifact per file, each downloading as that file.** Actions normally zips
an artifact, so a single bundle would mean downloading an archive and unpacking
it to reach the `.exe`. These are uploaded with `archive: false` instead, which
takes one file per upload and names the artifact after it — so the run page
lists `iPhone Identifier_<version>_x64_portable.exe` and clicking it gives you
exactly that.

That naming is also why the Windows files are renamed before upload: `name:` is
ignored in this mode, so the filename is the only place a label can live, and
`_portable` versus `_installer` is the distinction that matters.

The trade is that `gh run download` cannot fetch these: it assumes every
artifact is a zip and fails with "not a valid zip file". Download them from the
run page in a browser, which is where a technician would get them anyway.

It deliberately does **not** run on pull requests. A Rust compile costs minutes
on three runners where `npm run ci` costs seconds, and the shell it builds is a
window around a bundle CI already checks. Run it by hand when the shell itself
changes.

Tags carry the version: pushing `v0.2.0` requires `package.json` to say
`0.2.0`, and the run fails otherwise rather than shipping an app that
misreports itself. Releases are drafts, so nothing goes out without a look.

## The icon is drawn, not sourced

`npm run icon` runs `scripts/make-icon.js`, which draws the icon from shapes in
the app's own palette and then derives the per-platform set. It is a schematic
phone rear with a diagonal dual-camera housing — the same idiom as the diagrams,
and like them it carries no manufacturer's mark (SPEC.md D-20).

## The matrix is generated

`src/data/models.ts` is not hand-written. It is transcribed from
`reference/models/<id>.md` by `npm run transcribe`, so every value in it traces
to a cited source (SPEC.md D-11). Edit the reference file, then regenerate —
CI fails if the two drift apart.

## Questions ask with drawings; results show photographs

Every answer option that describes a shape, layout or position carries a
hand-drawn SVG (SPEC.md §8): schematic, two colours, and drawn from the product
shots committed under `reference/images/`. A schematic exaggerates the one
detail the question turns on and stays legible at 120 px, which is why questions
never show a real phone — a photograph beside a question invites matching the
bench against a picture instead of answering what was asked.

Once the app has stopped asking, the picture is the point. The 37 Apple product
shots in `reference/images/apple/` ship in the build (SPEC.md D-30) and appear
on the result screen, on a group of four or fewer candidates, and on every
reverse-lookup entry. They are internal to this shop and are not redistributed;
nothing else under `reference/` is imported by the build.

`questions.ts` names each diagram by a stable id and knows nothing about React;
`src/diagrams/registry.ts` binds ids to components, and a test asserts the two
agree in both directions — a declared id with no drawing, or a drawing nothing
declares, fails CI.

## Status

**All six phases are complete**: scaffolding, sourced data collection, the
matrix plus the identification engine, the identify UI, the diagrams, reverse
lookup, and product photographs with an expandable candidate strip. See
SPEC.md §10.

The app runs end to end. It asks questions, illustrated where a picture is what
the technician needs, narrows the candidate set, and reaches a model, a group,
or a stated terminal ambiguity — showing the product photograph of what it
concluded — and from the result, from a candidate chip, or from anywhere in the
flow, opens the reverse-lookup entry listing every characteristic the matrix
records for a model, drawn with the same diagrams the questions used.

A breadcrumb across the top says where in the identification you are — the
question being asked, the deep tier once you have entered it, the model a run
resolved to, and a model entry hanging off whichever of those you opened it from
(SPEC.md §4.7). Its root is always _New identification_, so the next phone on
the bench is one tap away from any screen; it offers to discard a run only when
there is one to discard. Browsing the models mid-run keeps the run in the trail,
so there is always a way back to it that costs nothing.

The candidate strip above each question reads "12 of 37 candidates" until it is
opened; expanded it shows all 37 names dimming as they go out, and a surviving
name opens that model's entry. Looking a model up mid-run never disturbs the
run: the view lives in the URL hash and the answer trail does not (SPEC.md
D-25), so the way back lands exactly where you left.

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
