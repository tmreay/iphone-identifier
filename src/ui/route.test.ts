/**
 * Hash routing — SPEC.md §4.5, §4.6 and D-25.
 *
 * `parseRoute` reads a string a user can edit, a bookmark can preserve across
 * builds, and a browser may have percent-encoded. Everything it can be handed
 * has to land somewhere sensible, so that is what is checked here; the hook
 * around it is three lines of `useSyncExternalStore` and has nothing to get
 * wrong that this does not already cover.
 */
import { describe, expect, it } from 'vitest'
import { models } from '../data/models.ts'
import { identifyRoute, parseRoute, routeHash } from './route.ts'

describe('parseRoute', () => {
  it('reads the three views', () => {
    expect(parseRoute('#/')).toEqual({ view: 'identify' })
    expect(parseRoute('#/models')).toEqual({ view: 'models' })
    expect(parseRoute('#/models/iphone-13-pro-max')).toEqual({
      view: 'model',
      id: 'iphone-13-pro-max',
      from: 'list',
    })
  })

  it('reads where a model entry was opened from', () => {
    expect(parseRoute('#/models/iphone-13?from=identify')).toEqual({
      view: 'model',
      id: 'iphone-13',
      from: 'identify',
    })
  })

  it('falls back to the list for an origin it does not recognise', () => {
    // The origin decides where a button goes, so an unreadable one has to mean
    // the destination that is always reachable rather than a run that may not
    // exist — a bookmark carries the hash but never the answer trail.
    for (const hash of [
      '#/models/iphone-13?',
      '#/models/iphone-13?from=elsewhere',
      '#/models/iphone-13?from=identify&extra=1',
    ]) {
      expect(parseRoute(hash), hash).toEqual({
        view: 'model',
        id: 'iphone-13',
        from: 'list',
      })
    }
  })

  it('reads the first query it is given and ignores what follows', () => {
    // A second '?' is not a shape any link in the app produces, so this pins
    // what a hand-edited hash does rather than a contract: the first query
    // decides, and the tail is ignored like any other unrecognised text.
    expect(parseRoute('#/models/iphone-13?from=identify?x')).toEqual({
      view: 'model',
      id: 'iphone-13',
      from: 'identify',
    })
  })

  it('lands on the flow for anything it does not recognise', () => {
    for (const hash of [
      '',
      '#',
      '#/nonsense',
      '#/models/iphone-13/extra',
      '#models',
      'not-a-hash',
      // A percent-escape that does not decode. `decodeURIComponent` throws on
      // this, and the flow is a better landing than a blank screen.
      '#/models/%E0%A4%A',
    ]) {
      expect(parseRoute(hash), hash).toEqual(identifyRoute)
    }
  })

  it('ignores a trailing slash, which a browser or a person may add', () => {
    expect(parseRoute('#/models/')).toEqual({ view: 'models' })
    expect(parseRoute('#/models/iphone-13/')).toEqual({
      view: 'model',
      id: 'iphone-13',
      from: 'list',
    })
    // Both at once: a browser that appends the slash to a link that already
    // carries the origin must not lose the origin to it.
    expect(parseRoute('#/models/iphone-13/?from=identify')).toEqual({
      view: 'model',
      id: 'iphone-13',
      from: 'identify',
    })
  })

  it('accepts a model id that no longer exists, and leaves that to the caller', () => {
    // Shape, not existence: an old bookmark parses, and `App` decides what to
    // show once it has the matrix to check against.
    expect(parseRoute('#/models/iphone-99')).toEqual({
      view: 'model',
      id: 'iphone-99',
      from: 'list',
    })
  })
})

describe('routeHash', () => {
  it('round-trips every model in the set', () => {
    for (const model of models) {
      for (const from of ['list', 'identify'] as const) {
        const route = { view: 'model', id: model.id, from } as const
        expect(parseRoute(routeHash(route)), model.id).toEqual(route)
      }
    }
  })

  it('round-trips the other two views', () => {
    for (const route of [identifyRoute, { view: 'models' } as const]) {
      expect(parseRoute(routeHash(route))).toEqual(route)
    }
  })

  it('never hands the browser a bare "#"', () => {
    // An empty hash leaves the '#' behind in most browsers and reloads in some.
    expect(routeHash(identifyRoute)).toBe('#/')
  })
})
