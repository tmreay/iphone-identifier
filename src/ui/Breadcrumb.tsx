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
import type { Crumb, CrumbTarget } from './presenters.ts'

export function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: Crumb[]
  onNavigate: (target: CrumbTarget) => void
}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
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
