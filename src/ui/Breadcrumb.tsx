/**
 * The breadcrumb — SPEC.md §4.7.
 *
 * Says where in the identification the app is, on every screen, rooted always
 * at a fresh identification (D-32). The trail itself is built in
 * `presenters.ts` and tested there; this renders it and nothing else.
 *
 * An ordered list rather than a row of buttons, because that is what it is: the
 * markup is the same claim the visual makes, so assistive technology gets the
 * path rather than a handful of unrelated controls. The separators are drawn
 * with `aria-hidden` — a screen reader reading "chevron" between every crumb
 * would bury the words that matter.
 */
import { useLayoutEffect, useRef } from 'react'
import type { Crumb, CrumbTarget } from './presenters.ts'

export function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: Crumb[]
  onNavigate: (target: CrumbTarget) => void
}) {
  const row = useRef<HTMLElement>(null)
  /*
    A trail wide enough to overflow scrolls, and a scroller opens at its start —
    which is the end that matters least. "New identification" is the crumb a
    technician can guess; where they are is the crumb they came to read, so on a
    narrow phone the row is scrolled to it. Only when it overflows: on a row that
    fits, `scrollLeft` will not move. Before paint rather than after: an effect
    that ran afterwards would commit the row at its start and then jump, and the
    flick would land on exactly the narrow screen the scrolling is for.

    Keyed on the labels rather than on the array, because the trail is rebuilt on
    every render and its identity says nothing about whether it changed.
  */
  const labels = crumbs.map((crumb) => crumb.label).join('›')
  useLayoutEffect(() => {
    const element = row.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [labels])

  return (
    /*
      Focusable because it scrolls. Every crumb can be a plain span — a fresh run
      on the flow has nothing to restart and nowhere else to be — and a scrolling
      box with no focusable child is one a keyboard cannot reach into at all.
    */
    <nav className="breadcrumb" aria-label="Breadcrumb" ref={row} tabIndex={0}>
      <ol className="breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const target = crumb.target
          const last = index === crumbs.length - 1
          return (
            <li key={crumb.key} className="breadcrumb-item">
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  ›
                </span>
              )}
              {target ? (
                <button
                  type="button"
                  className="breadcrumb-link"
                  onClick={() => onNavigate(target)}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className="breadcrumb-current"
                  aria-current={last ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
