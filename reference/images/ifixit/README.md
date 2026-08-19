# iFixit photographs

Three files. They exist for one reason: they are the direct evidence behind
`bottom_mic_hole_pattern`, the attribute that separates the iPhone X from the iPhone XS.

| File | Holes left of the port | Holes right | Value |
|---|---|---|---|
| `iphone-x/bottom-edge-03.jpg` | 6 | 6 | `symmetric_six_six` |
| `iphone-xs/bottom-edge-01.jpg` | 3 | 6 | `asymmetric_three_six` |
| `iphone-xs-max/bottom-edge-01.jpg` | 4 | 7 | `asymmetric_four_seven` |

Each is the hero image of that model's "Pentalobe Screws Replacement" guide, shot square
on to the bottom edge under the same lighting, so the three are directly comparable.
Source guides are in the `## Sources` list of the corresponding `reference/models/<id>.md`.

Counts were taken from 3× enlargements of the hole strip, not by eye at full frame — at
full frame the four/seven of the XS Max reads as three/six.

## Why these three and nothing else

SPEC.md §9 depends on this attribute: without it the iPhone X and XS are
not separable, and Phase 1 could only support it with an **iFixit forum answer** — the
weakest source in the whole reference set. These photographs replace that with something
you can look at.

They also caught a genuine error. Phase 1 gave the XS Max the same three/six as the XS,
✅ verified, from a forum answer that discusses only the X and the XS. The Max actually
has its own four/seven pattern. See SPEC.md §11.

A wider scrape of iFixit was collected and then discarded: most of it showed the inside of
opened handsets, which this project does not identify from. What survives is only the part
that closes an evidence gap the Apple renders cannot — Apple photographs the front and the
back, never the bottom edge.

## Not covered

Every other model. `bottom_mic_hole_pattern` is unresearched outside this group of three,
and the remaining 34 models carry no value for it. Under the §5.4 matching rule an absent
value eliminates nothing, so that is safe — it just means the attribute does no work
anywhere except here.

These are iFixit's photographs, kept for a single shop's internal use on the repo owner's
instruction. The repository is not distributed.
