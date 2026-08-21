/**
 * Transcribes reference/models/<id>.md into src/data/models.ts.
 *
 * D-11: no model attribute may be written into the matrix from memory. Rather
 * than retype 666 rows, this reads them straight out of the evidence layer, so
 * the matrix cannot drift from its sources. `npm run transcribe:check`
 * regenerates in memory and fails if the committed file differs — CI runs it.
 *
 * Confidence flags (reference/README.md) decide what crosses over:
 *   ✅ verified / 🟡 inferred  -> transcribed
 *   🔴 unverified             -> dropped; the value is a guess
 *   ⚪ not applicable          -> dropped; there is no value to carry
 * Dropping is safe: under SPEC.md §5.4 an absent attribute eliminates nothing.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import prettier from 'prettier'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const referenceDir = path.join(root, 'reference', 'models')
const outputFile = path.join(root, 'src', 'data', 'models.ts')

const TRANSCRIBE = new Set(['✅ verified', '🟡 inferred'])
const DROP = new Set(['🔴 unverified', '⚪ not applicable'])

/** Section heading -> how many attribute rows it must have (SPEC.md §6.1, §6.2). */
const TIER_TABLES = [
  ['Coarse-tier attributes', 8],
  ['Deep-tier attributes', 10],
]

/** Every model in scope (D-01). */
const EXPECTED_MODEL_COUNT = 37

/** Pulls the body of a `## <heading>` section, up to the next `## `. */
function section(text, heading) {
  // No `m` flag: `$` must mean end-of-input, not end-of-line, or the lazy body
  // stops at the heading's own newline and every section reads as empty.
  const pattern = new RegExp(`(?:^|\\n)## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = pattern.exec(text)
  if (!match) throw new Error(`missing section: ${heading}`)
  return match[1]
}

/** Every `backticked` token in a table cell, in order. */
function codeValues(cell) {
  return [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1])
}

/**
 * Reads an attribute table: `| \`attr\` | values | flag | source | note |`.
 * Returns the flag-filtered [attribute, values] pairs plus `seen`, the number of
 * rows the table actually had — the caller checks that against the schema so a
 * parser that quietly matches nothing fails loudly instead of emitting an empty
 * matrix.
 */
function parseAttributeTable(body, file) {
  const rows = []
  let seen = 0
  for (const line of body.split('\n')) {
    const match = /^\|\s*`([a-z_]+)`\s*\|([^|]*)\|([^|]*)\|/.exec(line)
    if (!match) continue
    const [, attribute, valueCell, flagCell] = match
    const flag = flagCell.trim()
    seen += 1
    if (DROP.has(flag)) continue
    if (!TRANSCRIBE.has(flag)) {
      throw new Error(
        `${file}: unrecognised confidence flag "${flag}" on \`${attribute}\``,
      )
    }
    const values = codeValues(valueCell)
    if (values.length === 0) {
      throw new Error(
        `${file}: \`${attribute}\` is flagged "${flag}" but carries no value`,
      )
    }
    rows.push([attribute, values])
  }
  return { rows, seen }
}

/** Reads the colours table: `| \`value\` | Marketing name | note |`. */
function parseColourTable(body, file) {
  const colours = []
  for (const line of body.split('\n')) {
    const match = /^\|\s*`([a-z_]+)`\s*\|([^|]*)\|/.exec(line)
    if (!match) continue
    const [, value, marketingCell] = match
    const marketing = marketingCell.trim()
    if (!marketing)
      throw new Error(`${file}: colour \`${value}\` has no marketing name`)
    colours.push({ value, marketing })
  }
  return colours
}

function parseModelFile(text, file) {
  const name = /^# (.+)$/m.exec(text)?.[1]?.trim()
  const header =
    /\*\*Model id:\*\*\s*`([a-z0-9-]+)`\s*·\s*\*\*Released:\*\*\s*(\d{4})/.exec(text)
  if (!name || !header)
    throw new Error(`${file}: could not read the name/id/year header`)

  const attributes = {}
  for (const [heading, expected] of TIER_TABLES) {
    const { rows, seen } = parseAttributeTable(section(text, heading), file)
    if (seen !== expected) {
      throw new Error(`${file}: ${heading} has ${seen} rows, expected ${expected}`)
    }
    for (const [attribute, values] of rows) {
      if (attribute in attributes)
        throw new Error(`${file}: \`${attribute}\` appears twice`)
      attributes[attribute] = values
    }
  }

  const colours = parseColourTable(section(text, 'Colours'), file)
  if (colours.length === 0) throw new Error(`${file}: no colours listed`)
  return { id: header[1], name, released: Number(header[2]), attributes, colours }
}

export function readReferenceModels() {
  const files = readdirSync(referenceDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
  if (files.length !== EXPECTED_MODEL_COUNT) {
    throw new Error(
      `reference/models/ has ${files.length} model files, expected ${EXPECTED_MODEL_COUNT}`,
    )
  }

  const models = files.map((f) => {
    const parsed = parseModelFile(readFileSync(path.join(referenceDir, f), 'utf8'), f)
    if (`${parsed.id}.md` !== f)
      throw new Error(`${f}: declares model id \`${parsed.id}\``)
    return parsed
  })

  // Chronological, then natural order by name. Presentation only — no attribute
  // depends on it.
  const byName = new Intl.Collator('en', { numeric: true }).compare
  return models.sort((a, b) => a.released - b.released || byName(a.name, b.name))
}

const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const list = (values) => `[${values.map(quote).join(', ')}]`

function render(models) {
  const entries = models.map((model) => {
    const attributes = Object.entries(model.attributes)
      .map(([attribute, values]) => `      ${attribute}: ${list(values)},`)
      .join('\n')
    const colours = model.colours
      .map(
        (c) => `      { value: ${quote(c.value)}, marketing: ${quote(c.marketing)} },`,
      )
      .join('\n')
    return [
      `  {`,
      `    id: ${quote(model.id)},`,
      `    name: ${quote(model.name)},`,
      `    released: ${model.released},`,
      `    attributes: {`,
      attributes,
      `    },`,
      `    colours: [`,
      colours,
      `    ],`,
      `  },`,
    ].join('\n')
  })

  return `/**
 * The attribute matrix — SPEC.md §5.4.
 *
 * GENERATED FILE. Do not edit by hand: run \`npm run transcribe\` after changing
 * anything under reference/models/. Every value here is transcribed from that
 * evidence layer, which is the source of truth (D-11).
 *
 * Attributes flagged 🔴 unverified or ⚪ not applicable in reference/ are absent
 * rather than guessed. Under the §5.4 matching rule an absent attribute
 * eliminates nothing, so an incomplete matrix widens the candidate group
 * instead of returning a wrong answer.
 */
import type { IPhoneModel } from './types.ts'

export const models: IPhoneModel[] = [
${entries.join('\n')}
]
`
}

// Formatted with the repo's Prettier config so the generated file is
// byte-stable under `format:check` and `--check` cannot fail on whitespace.
const rendered = await prettier.format(render(readReferenceModels()), {
  ...(await prettier.resolveConfig(outputFile)),
  filepath: outputFile,
})

if (process.argv.includes('--check')) {
  const onDisk = readFileSync(outputFile, 'utf8')
  if (onDisk !== rendered) {
    console.error(
      'src/data/models.ts is out of step with reference/models/. Run `npm run transcribe`.',
    )
    process.exit(1)
  }
  console.log('src/data/models.ts matches reference/models/.')
} else {
  writeFileSync(outputFile, rendered)
  console.log(`Wrote ${path.relative(root, outputFile)}`)
}
