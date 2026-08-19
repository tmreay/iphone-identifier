# Colour palette

Phase 1 output for SPEC.md §6.5. Fourteen descriptive values cover every colour
Apple shipped across the 37 models in scope. Every value is used by at least one
model, and every model colour maps to exactly one value — the two conditions the
"palette is closed" unit test in §7 will assert.

**The engine matches on the descriptive value only.** Marketing names are display
text for the reverse-lookup entry and for talking to suppliers.

## The palette

| Descriptive value | Apple marketing names it covers | Model-colours |
|---|---|---|
| `black` | Space Gray, Black, Graphite, Midnight, Space Black, Black Titanium | 35 |
| `white_silver` | Silver, White, Starlight, White Titanium, Natural Titanium, Cloud White | 39 |
| `gold` | Gold, Desert Titanium, Light Gold | 15 |
| `red` | (PRODUCT) RED | 12 |
| `pink` | Pink, Soft Pink | 7 |
| `purple` | Purple, Deep Purple, Lavender | 8 |
| `light_blue` | Blue (XR, 13, 14, 15), Sierra Blue, Sky Blue, Mist Blue | 11 |
| `dark_blue` | Blue (12), Pacific Blue, Blue Titanium, Ultramarine, Deep Blue | 10 |
| `light_green` | Green (11, 12, 15), Sage | 6 |
| `dark_green` | Green (13), Midnight Green, Alpine Green | 6 |
| `yellow` | Yellow | 6 |
| `orange` | Cosmic Orange | 2 |
| `coral` | Coral | 1 |
| `teal` | Teal | 2 |

Suggested question option labels: "black / dark grey", "white / silver",
"gold", "red", "pink", "purple", "light blue", "dark blue", "light green",
"dark green", "yellow", "orange", "coral", "teal".

## Decisions

**`black` swallows Space Gray, Graphite, Midnight, Space Black and Black
Titanium.** These are all near-black under shop lighting. Asking a technician to
tell Graphite from Space Black inverts the problem the app exists to solve
(§6.5: "if two shades are plausibly confusable at a workbench under shop
lighting, they are one value").

**`white_silver` is a single value, not two.** On a Pro model "Silver" is a
white glass back with a silver frame; on a standard model "White" is a white
glass back with a silver-ish aluminium frame. They are the same thing to the eye.
Starlight and Natural Titanium fold in for the same reason.

**Blue and green are split by shade, not merged.** Pacific Blue (deep navy) and
Sierra Blue (pale ice) are not confusable, and neither are Midnight Green and
Sage. Merging them would throw away real discriminating power. This is the one
place the palette is deliberately finer than "one word per hue".

**Apple's bare "Blue" and "Green" resolve per model.** Apple reused both names
across generations at very different shades, so the mapping is per model rather
than global — see the `SHADE` table in the generator, and the per-model files.

## Known risks

These are the entries most likely to produce a wrong answer, in order:

1. **iPhone 13 / 13 mini Blue is a boundary shade and carries *both* values.**
   Compared against the committed images, the iPhone 13 Blue is clearly darker
   than the iPhone 14 and 15 pale blues and clearly lighter than Pacific Blue. It
   is recorded as both `light_blue` and `dark_blue`, so neither answer can
   eliminate the model. This is the pattern to reuse for any other boundary shade.
2. **iPhone 17 Sage** may deserve the same treatment. In the committed image it
   reads as a medium green rather than the pale green it is grouped with. It is
   currently `light_green` alone — revisit once a side-by-side image exists.
3. **iPhone 16 Pro Natural Titanium** is a warm grey-beige. It is grouped under
   `white_silver`, but a technician could reasonably answer `gold`. Consider
   giving it both values.
4. **iPhone 15 pale colours are very desaturated.** Its Blue, Green and Pink are
   pale enough that a technician might answer `white_silver` instead.
5. **`teal`.** iPhone 16 Teal is a pale blue-green. A technician may well answer
   "light blue" or "light green" instead. Consider giving the iPhone 16 all three
   values so none of them eliminates it — the data model permits multiple values
   per attribute, and this is exactly the case it exists for.
6. **`coral`.** One model-colour in the whole set (iPhone XR). Cheap to keep, and
   if a technician picks "red" or "orange" instead the XR is wrongly eliminated —
   same mitigation as `teal` applies.

## Standing caveat

Colour is the one attribute that can fail *unsafely* (§6.4). A rehoused phone or
one with replaced back glass will answer wrongly and eliminate the correct model.
Every colour question must carry the "original back glass only" label and a
prominent "can't tell".
