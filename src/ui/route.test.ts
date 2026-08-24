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
    })
  })

  it('accepts a model id that no longer exists, and leaves that to the caller', () => {
    // Shape, not existence: an old bookmark parses, and `App` decides what to
    // show once it has the matrix to check against.
    expect(parseRoute('#/models/iphone-99')).toEqual({
      view: 'model',
      id: 'iphone-99',
    })
  })
})

describe('routeHash', () => {
  it('round-trips every model in the set', () => {
    for (const model of models) {
      const route = { view: 'model', id: model.id } as const
      expect(parseRoute(routeHash(route)), model.id).toEqual(route)
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
