/**
 * Where in the app we are — SPEC.md §4.5, §4.6.
 *
 * Phase 5 gives the app a second place to be, so it needs a way to say which.
 * That is held in the URL hash rather than in React state, for one reason that
 * matters on the target device: §2 puts this on a phone or tablet at a
 * workbench, and on a phone the system Back button is the back button. A view
 * kept in `useState` makes it leave the app; a view kept in the hash makes it
 * step back through the entry, the list and the flow, which is what someone
 * pressing it means (D-25).
 *
 * Deliberately not a router library. §5.1 says no dependency without a concrete
 * need, and three routes with no parameters beyond a model id do not make one.
 * What a router would buy — nested layouts, loaders, guards — none of this app
 * has.
 *
 * **The identify flow's state stays in React**, not here. It is the answer
 * trail plus a tier (§5.4), it is not addressable, and putting it in the URL
 * would make a bookmark into a half-finished diagnosis. So looking a model up
 * mid-flow and coming back leaves the run exactly where it was, which is the
 * point of the link the result screen carries (§4.5).
 *
 * Parsing is the part that can be wrong, so it is a pure function tested under
 * the project's `node` environment. The hook is the thin part.
 */
import { useCallback, useSyncExternalStore } from 'react'
import type { ModelId } from '../data/types.ts'

export type Route =
  { view: 'identify' } | { view: 'models' } | { view: 'model'; id: ModelId }

export const identifyRoute: Route = { view: 'identify' }

const MODELS = '#/models'
/** `#/models/<id>`. No metacharacters in the prefix, so it needs no escaping. */
const MODEL_PATTERN = new RegExp(`^${MODELS}/([^/]+)$`)

/**
 * Reads a route out of a location hash.
 *
 * Anything unrecognised is the identify flow. A hash is user-editable and
 * survives a bookmark taken against an older build, so it is an input rather
 * than a contract — and the flow is the screen that always makes sense, where a
 * "no such page" screen would only ever be an apology. A hash naming a model
 * that no longer exists parses fine and is resolved by the caller, which has
 * the matrix; this function is about shape, not existence.
 */
export function parseRoute(hash: string): Route {
  const trimmed = hash.replace(/\/+$/, '')
  if (trimmed === MODELS) return { view: 'models' }

  const id = MODEL_PATTERN.exec(trimmed)?.[1]
  if (id !== undefined) {
    // Ids are `[a-z0-9-]+` so nothing needs escaping on the way out, but a hash
    // can carry anything and a browser may have percent-encoded it on the way
    // in. Decoding a malformed escape throws, and a bad URL should land on the
    // flow like any other unrecognised hash rather than take the app down.
    try {
      return { view: 'model', id: decodeURIComponent(id) }
    } catch {
      return identifyRoute
    }
  }

  return identifyRoute
}

/** The hash a route is addressed by. Inverse of `parseRoute`. */
export function routeHash(route: Route): string {
  switch (route.view) {
    case 'models':
      return MODELS
    case 'model':
      return `${MODELS}/${encodeURIComponent(route.id)}`
    default:
      // Not '' — assigning an empty hash leaves the '#' behind in most browsers
      // and reloads in some. '#/' is the one spelling of "the flow".
      return '#/'
  }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const currentHash = () => window.location.hash
// The build is static and never server-rendered (§5.1); this is the value
// `useSyncExternalStore` asks for on a server and is here to satisfy the shape.
const serverHash = () => '#/'

/**
 * The current route, and a way to change it.
 *
 * Navigating assigns the hash, so each move is a history entry the Back button
 * can undo. Assigning the hash already in place is a no-op in every browser, so
 * a repeated tap does not stack duplicates for Back to walk back through.
 */
export function useRoute(): [Route, (route: Route) => void] {
  const hash = useSyncExternalStore(subscribe, currentHash, serverHash)
  const navigate = useCallback((route: Route) => {
    window.location.hash = routeHash(route)
  }, [])
  return [parseRoute(hash), navigate]
}
