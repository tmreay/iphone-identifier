# Reference images

32 files covering all 37 models. Every one is an official Apple product image,
taken from the model's own tech-spec page on support.apple.com or from Apple
Newsroom. The source URL for each is recorded in the "Reference images" section
of the corresponding `reference/models/<id>.md`.

Per SPEC.md §8 and D-13 these are the drawing source for the Phase 4 SVG
diagrams. They are never imported by any module, so they never enter the build.
Everything is already at or under ~1100 px on the long edge, well inside the
~1600 px guidance, so nothing needed downscaling. Total about 9 MB.

Five files cover two models each, because Apple publishes one hero for the pair
and the files are byte-identical:

| File | Models |
|---|---|
| `iphone-14-and-14-plus.png` | iPhone 14, iPhone 14 Plus |
| `iphone-14-pro-and-pro-max.png` | iPhone 14 Pro, iPhone 14 Pro Max |
| `iphone-16-and-16-plus.png` | iPhone 16, iPhone 16 Plus |
| `iphone-16-pro-and-pro-max.png` | iPhone 16 Pro, iPhone 16 Pro Max |
| `iphone-17-pro-and-pro-max.png` | iPhone 17 Pro, iPhone 17 Pro Max |

## What these images do and do not show

They show the **rear in every finish, plus the front** — enough to read camera
layout, bump or plateau shape, flash position, Apple logo position, front cutout,
and the side buttons. That is most of what Phase 4 needs to draw from.

They do **not** show:

- **The bottom edge.** So the mic and speaker hole patterns are still unphotographed.
  The iPhone X versus XS pattern — the one place it discriminates — is text-sourced
  from iFixit instead, and is marked verified on that basis.
- **The rear "iPhone" wordmark.** Apple's renders omit the regulatory text and
  wordmark entirely, on models that have them. `rear_wordmark` therefore rests on
  its text sources, not on these images.
- **A usable iPhone 16 versus iPhone 17 distinction.** Both were compared directly
  and the camera pills are the same. See `reference/findings.md` §2.

Some of the older tech-spec heroes are small — the iPhone 12 Pro's is 419 × 175 —
and show the rear at an angle rather than square on. They are adequate for reading
a layout but thin for drawing detail. The iPhone 8 image is almost entirely
front-facing, so the flash position on the 8 / SE bodies is still unread.

## Remaining shot list

If a technician can photograph handsets in the shop, these are the gaps, in order
of what they unblock:

1. **Bottom edges** of the iPhone X and iPhone XS, side by side — confirms the
   hole-pattern tell that currently rests on a forum answer.
2. **Rear of an iPhone 8 and an iPhone SE (2nd gen)**, side by side — confirms the
   wordmark and logo-position tell.
3. **Camera plateaus of an iPhone 13 and an iPhone 14**, side by side — confirms
   the bump-size tell.
4. **Square-on rears** for the pre-iPhone-13 models, to replace the low-resolution
   angled heroes before Phase 4 drawing starts.

iFixit teardowns are a reasonable source for close-ups the shop cannot shoot.
Record the source URL in the model file either way.
