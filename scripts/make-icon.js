// Draws the desktop app icon, then hands it to `tauri icon` to produce the
// per-platform set under src-tauri/icons/.
//
// The icon is generated rather than committed as an opaque binary for the same
// reason the matrix is (SPEC.md D-14): a future session can see what it is made
// of and change it. It is a schematic phone rear in the app's own palette --
// the diagonal dual-camera housing, which is the single most recognisable thing
// this app asks about -- and carries no manufacturer's mark (SPEC.md D-20).
//
// Usage: npm run icon

import { deflateSync } from 'node:zlib'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS = resolve(ROOT, 'src-tauri/icons')
const OUT = resolve(ICONS, 'source.png')

const SIZE = 1024
// 4x4 samples per pixel. Enough to keep the rounded corners clean at 1024 px,
// and `tauri icon` downscales from here anyway.
const SAMPLES = 4

// src/ui/styles.css, dark theme. The icon sits on a dark ground in both themes
// because an app icon has no theme to follow.
const INK = [0x16, 0x18, 0x1d, 0xff] // --fg
const PANEL = [0xec, 0xee, 0xf2, 0xff] // --fg, dark theme
const ACCENT = [0x0b, 0x6b, 0xcb, 0xff] // --accent

/** Signed distance to a rounded rectangle; <= 0 is inside. */
function roundedRect(x, y, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(x - cx) - (halfW - radius)
  const dy = Math.abs(y - cy) - (halfH - radius)
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  return outside + Math.min(Math.max(dx, dy), 0) - radius
}

/** Signed distance to a circle; <= 0 is inside. */
function circle(x, y, cx, cy, radius) {
  return Math.hypot(x - cx, y - cy) - radius
}

const MID = SIZE / 2

// Body: a phone rear, portrait, generous corner radius.
const BODY = { halfW: 226, halfH: 370, radius: 84 }

// Housing: top-left of the body, inset from both edges by the same margin.
const HOUSING_HALF = 108
const HOUSING_INSET = 44
const HOUSING_CX = MID - BODY.halfW + HOUSING_INSET + HOUSING_HALF
const HOUSING_CY = MID - BODY.halfH + HOUSING_INSET + HOUSING_HALF

// Two lenses on the diagonal -- the `dual_diagonal_square` layout.
const LENS_OFFSET = 44
const LENS_RADIUS = 46
const PUPIL_RADIUS = 21

/** The colour at one sample point, painted back to front. */
function sample(x, y) {
  let colour = null

  if (roundedRect(x, y, MID, MID, MID, MID, 224) <= 0) colour = INK
  if (roundedRect(x, y, MID, MID, BODY.halfW, BODY.halfH, BODY.radius) <= 0)
    colour = PANEL
  if (roundedRect(x, y, HOUSING_CX, HOUSING_CY, HOUSING_HALF, HOUSING_HALF, 60) <= 0)
    colour = INK

  for (const sign of [-1, 1]) {
    const cx = HOUSING_CX + sign * LENS_OFFSET
    const cy = HOUSING_CY + sign * LENS_OFFSET
    if (circle(x, y, cx, cy, LENS_RADIUS) <= 0) colour = PANEL
    if (circle(x, y, cx, cy, PUPIL_RADIUS) <= 0) colour = ACCENT
  }

  return colour
}

/** Renders the icon to a straight-alpha RGBA buffer. */
function render() {
  const pixels = Buffer.alloc(SIZE * SIZE * 4)
  const step = 1 / SAMPLES
  const total = SAMPLES * SAMPLES

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      let r = 0
      let g = 0
      let b = 0
      let hits = 0

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const colour = sample(px + (sx + 0.5) * step, py + (sy + 0.5) * step)
          if (colour === null) continue
          r += colour[0]
          g += colour[1]
          b += colour[2]
          hits++
        }
      }

      const at = (py * SIZE + px) * 4
      if (hits === 0) continue
      // Average over the samples that landed on the shape, so the colour at a
      // partly covered edge pixel is the shape's colour and only alpha falls off.
      pixels[at] = Math.round(r / hits)
      pixels[at + 1] = Math.round(g / hits)
      pixels[at + 2] = Math.round(b / hits)
      pixels[at + 3] = Math.round((hits / total) * 255)
    }
  }

  return pixels
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Encodes an RGBA buffer as a PNG. No dependencies -- zlib is all it needs. */
function encodePng(pixels, size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  // Bytes 10-12 stay zero: deflate, adaptive filtering, no interlacing.

  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    // Filter type 0 (none) per scanline. The image is flat colour, so deflate
    // does the work and a smarter filter would buy nothing.
    raw[y * (stride + 1)] = 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(ICONS, { recursive: true })
writeFileSync(OUT, encodePng(render(), SIZE))
console.log(`Drew ${OUT}`)

// `tauri icon` derives the per-platform set -- the .ico Windows needs, the
// .icns for macOS, the PNG ladder for Linux. It ships as a prebuilt binary, so
// this step wants no Rust toolchain.
execFileSync('npx', ['tauri', 'icon', OUT], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
})

// It also writes Android and iOS sets unconditionally, with no flag to opt out.
// Nothing here targets mobile (SPEC.md D-22 is desktop), so they are dropped
// rather than committed as thirty files no build reads.
for (const platform of ['android', 'ios']) {
  rmSync(resolve(ICONS, platform), { recursive: true, force: true })
}

console.log('Icon set written to src-tauri/icons/')
