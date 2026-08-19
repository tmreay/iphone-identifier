import { describe, expect, it } from 'vitest'

/**
 * Phase 0 smoke test: proves the Vitest toolchain runs. Delete once the real
 * engine tests land in Phase 2 (SPEC.md §7, §10).
 */
describe('toolchain', () => {
  it('runs tests', () => {
    expect(true).toBe(true)
  })
})
