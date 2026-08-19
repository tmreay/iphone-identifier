# reference/

Phase 1 output — sourced model facts and reference images. See SPEC.md §10.

Nothing here is imported by the build. It is the evidence layer that
`src/data/models.ts` must trace back to (D-11): no model attribute may be written
into the matrix from memory.

| File | What it is |
|---|---|
| `models/<id>.md` | One file per model. Every attribute row carries a source and a confidence flag. **This is the source of truth.** |
| `findings.md` | What the research changed about the spec's assumptions. Read this first. |
| `palette.md` | The colour palette (SPEC §6.5) — 14 descriptive values, the marketing names each covers, and the known risks. |
| `matrix.md` | All 37 models in three tables. A reading aid only — it carries no sources, so do not transcribe from it. |
| `images/` | 32 official Apple product images covering all 37 models. See `images/README.md` for what they do and do not show. |

## Status

- **37 / 37 models** researched and written up (the iPhone 17e was added to scope during this phase — see `findings.md` §7).
- Coarse-tier attributes, dimensions, SIM-tray position and colour marketing names
  are verified against Apple's own tech-spec pages and support documentation.
- `flash_position` is read off the committed images for 12 models and still
  unread for the other 25 — the images exist, they just have not all been
  reviewed. `bottom_mic_hole_pattern` is verified only for the iPhone X / XS pair;
  no committed image shows a bottom edge.
- Separability was checked by brute force. After both tiers three groups remain
  ambiguous: **SE (2nd) vs SE (3rd)** (expected), **iPhone 16 vs iPhone 17** in
  black or white (new, terminal — no tiebreaker known), and **iPhone 16e vs iPhone 17e** in black or
  white (new, but a MagSafe accessory separates them on a dead phone). See
  `findings.md` §2.

## Confidence flags

| Flag | Meaning | Safe to transcribe? |
|---|---|---|
| ✅ verified | Traced to a cited source | Yes |
| 🟡 inferred | Read from an adjacent source or generation lineage | Yes, with the caveat recorded |
| 🔴 unverified | Researcher's reading, no source | **No — leave the value absent** |

Leaving an unverified value absent is safe: under the §5.4 matching rule missing
data eliminates nothing, so the result degrades to a larger candidate group rather
than a wrong answer.
