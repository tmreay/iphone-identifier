# Apple product shots — clean back and front

37 images, one per model, each a single device photographed straight on with the **back
and the front side by side** on white. These are Apple's own buy-flow product shots.

They replace what the lineup renders one level up could not give: those are angled colour
family shots with the bodies overlapping each other, several of them tiny (the iPhone 12
Pro's is 419 × 175). These show one device, unobstructed, at a readable size.

## What they are good for

Everything the identification matrix asks about the outside of a closed phone: rear camera
layout and housing shape, flash position, Apple logo position, the rear "iPhone" wordmark
on the models that have it, front cutout (bezel, notch, Dynamic Island), home button, and
the side buttons. `iphone-8.jpg` shows the wordmark and the Touch ID ring clearly;
`iphone-16-pro.jpg` shows the triple-camera square unobstructed.

## Provenance

`manifest.json` records, per model, the Apple slug, the full source URL and the final
pixel size. Every file comes from `store.storeimages.cdn-apple.com`, requested at
1800 × 1800 and then auto-trimmed of the canvas padding Apple's image service adds.

Apple has used three different slug conventions over the range, so the source URLs do not
follow one shape:

| Convention                                           | Era       | Example                                                    |
| ---------------------------------------------------- | --------- | ---------------------------------------------------------- |
| `{model}-{colour}-select-{year}`                     | 2017–2020 | `iphone-x-silver-select-2017`                              |
| `{model}-{colour}-hero`                              | 12 Pro    | `iphone-12-pro-graphite-hero`                              |
| `{model}-{colour}-select`                            | 13 Pro    | `iphone-13-pro-silver-select`                              |
| `{model}-finish-select-{yyyymm}-{size}inch-{colour}` | 2022–2024 | `iphone-16-pro-finish-select-202409-6-3inch-blacktitanium` |
| `{model}-finish-select-{colour}-{yyyymm}`            | 2025+     | `iphone-air-finish-select-spaceblack-202509`               |

A dark finish was chosen wherever one exists. Apple shoots all of these on white, so a
pale body is close to invisible at the edges and defeats both the eye and the automatic
trimming.

## Gaps and caveats

All 37 models are covered. The iPhone 12 Pro and 12 Pro Max took a fifth slug convention
to find — that generation used `-hero` rather than `-select`, recovered from an archived
copy of Apple's 2021 buy page. The assets are still live on Apple's CDN.

**Resolution is uneven**, because it is capped by whatever Apple published and the service
does not upscale. Most models land around 1100 × 1500, but the Pro models from the 13
through the 17, plus the iPhone X, 13 and 13 mini, are only around 500 × 650. Adequate for
reading a layout, thin for drawing fine detail.

**The plain iPhone 17 is the one three-quarter view in the set.** Its straight-on
`-select-` asset renders thumbnail-sized at every size requested, so `iphone-17.jpg` uses
the `finish-select` asset instead, which is angled. Every other model is straight on.

These are Apple's marketing renders, not photographs of real handsets — they show the
phone as designed, not as it wears. They also frame the phone face-on and back-on only, so
the bottom edge (port, mic and speaker hole pattern) and the SIM tray edge are still not
covered by any image in this repository.

## Measurements taken from these images

Phase 4 measured the diagonal-dual camera housings off this set, because
`camera_bump_size` is a relative question and nothing else in the repository
records a size for the housing. Recorded here so it is not redone.

The method matters as much as the numbers. Every shot in this set is square on
— the back panel's left edge holds the same x to within 4 px down its whole
straight run — so the panel can be measured directly. Body width in pixels is
derived from the panel's height and the millimetre dimensions in
`../../matrix.md`, rather than from its right edge, because on some shots the
front view overlaps the back and hides it. Where the right edge _is_ visible it
confirms the derived width to within 2 px.

| Model          | Housing width | Outer lens | `camera_bump_size` |
| -------------- | ------------- | ---------- | ------------------ |
| iPhone 13      | 29.5 mm       | ~13.5 mm   | `smaller`          |
| iPhone 13 mini | 28.9 mm       | ~13.9 mm   | `smaller`          |
| iPhone 14      | 30.7 mm       | ~15.8 mm   | `larger`           |
| iPhone 14 Plus | 30.7 mm       | ~15.9 mm   | `larger`           |
| iPhone 15      | 31.6 mm       | ~15.9 mm   | `larger`           |
| iPhone 15 Plus | 31.7 mm       | ~15.9 mm   | `larger`           |

The 14 figure is independently confirmed: the 14 and the 14 Plus are different
images at different body widths and land on the same 30.7 mm. The 13 and 13 mini
agree the same way. **Lens figures are softer** — a lens rim gives several
concentric edges (barrel, chrome ring, glass), so they are good to about half a
millimetre and no further.

These are marketing renders, so the numbers describe the phone as designed. That
is what the question asks about, but it is worth knowing they are not calipers.

### The iPhone 13 is the weakest image in this set for it

At 485 × 661 of content it gives about 320 px of body width, so a pixel is
0.22 mm. Adequate for a 2 mm difference, but only just. Apple's CDN was searched
for a better square-on 13: the other colours on the `-select-2021` convention
are the same size, `iphone-13-finish-select-202207-6-1inch-midnight` exists but
is the angled finish shot, and `iphone-13-model-unselect-gallery-1-202207` is a
wide lineup with the phone smaller still. Wikimedia Commons has CC BY-SA
photographs of real handsets, but on a real phone the housing is the same colour
as the body and its rim shows only as a lighting artefact — measurably worse than
a studio render. No better source was found; the numbers above stand on the
cross-checks instead.
