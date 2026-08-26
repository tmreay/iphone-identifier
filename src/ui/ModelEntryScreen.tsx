/**
 * One model's reverse-lookup entry — SPEC.md §4.6, §6.5, §8.
 *
 * Every characteristic the matrix records for this model, carrying the same
 * diagrams the questions use — so confirming a result is comparing the phone
 * against the pictures it was just asked about, not against a second vocabulary
 * for the same features.
 *
 * Reached from the browsable list, from the result screen's link, or from a
 * chip in the candidate strip mid-run (§4.1). The last of those is why leaving
 * is a prop rather than a fixed destination: an entry opened from a run goes
 * back to the run, which is still exactly where it was, because navigating
 * never touched it (D-25).
 *
 * **Read-only** (D-24). Correcting a value means editing
 * `reference/models/<id>.md` and re-running the transcription, because the
 * matrix is a build output with nowhere to write back to and an in-app edit
 * would put a value in it that no source backs. The entry names the file to
 * edit rather than pretending the screen is the place to do it.
 */
import { Diagram } from '../diagrams/index.tsx'
import type { IPhoneModel, Question } from '../data/types.ts'
import { ModelPhoto } from './ModelPhoto.tsx'
import type { EntryRow } from './lookup.ts'
import { boundaryShadeNote, colourRows, entryRows, notRecordedNote } from './lookup.ts'
import { listPhrase } from './presenters.ts'

function Rows({ rows }: { rows: EntryRow[] }) {
  return (
    <dl className="entry-rows">
      {rows.map((row) => (
        <div key={row.attribute} className="entry-row">
          <dt className="entry-label">{row.label}</dt>
          <dd className="entry-values">
            {row.values.length === 0 ? (
              <span className="entry-blank">Not recorded</span>
            ) : (
              row.values.map((value) => (
                <span key={value.value} className="entry-value">
                  <Diagram id={value.diagram} />
                  <span>{value.label}</span>
                </span>
              ))
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ModelEntryScreen({
  model,
  questions,
  backLabel,
  onBack,
}: {
  model: IPhoneModel
  questions: Question[]
  /** Where leaving goes, in words — the list, or the run this was opened from. */
  backLabel: string
  onBack: () => void
}) {
  const rows = entryRows(model, questions)
  const coarse = rows.filter((row) => row.tier === 'coarse')
  const deep = rows.filter((row) => row.tier === 'deep')
  const colours = colourRows(model, questions)
  const boundary = boundaryShadeNote(model)
  const blanks = rows.some((row) => row.values.length === 0)

  return (
    <section className="screen">
      <p className="count">Released {model.released}</p>
      <h2 className="result-name">{model.name}</h2>

      {/*
        The product shot, above the characteristics that describe it (D-30). It
        is the fastest of the checks on this screen — most models are wrong at a
        glance — and the rows below are what settles the ones that are not.
      */}
      <ModelPhoto model={model} />

      <h3 className="entry-heading">At a glance</h3>
      <Rows rows={coarse} />

      <h3 className="entry-heading">Close inspection</h3>
      <Rows rows={deep} />

      <h3 className="entry-heading">Colours</h3>
      <dl className="entry-rows">
        {colours.map((colour) => (
          <div key={colour.value} className="entry-row">
            <dt className="entry-label">{colour.label}</dt>
            <dd className="entry-values">
              {/*
                Apple's names, listed in full (§6.5). They are display text and
                never narrow anything (D-12) — but they are what a supplier or a
                customer will say, which is half of why this screen exists.
              */}
              <span className="entry-value">{listPhrase(colour.marketing)}</span>
            </dd>
          </div>
        ))}
      </dl>

      {boundary && <p className="hint">{boundary}</p>}

      {blanks && <p className="hint">{notRecordedNote}</p>}

      <p className="note">
        Read-only. A wrong value here is a wrong value in{' '}
        <code>reference/models/{model.id}.md</code> — correct it there and re-run the
        transcription.
      </p>

      <button type="button" className="secondary" onClick={onBack}>
        {backLabel}
      </button>
    </section>
  )
}
