/**
 * Product photographs — SPEC.md §4.5, §8, §12.
 *
 * The reference shots in `reference/images/apple/` are now part of the build
 * (D-27). Phases 1 to 5 kept them out of it under D-13, because redistributing
 * Apple's product photography is a thing to decide deliberately rather than to
 * do as a side effect of a UI change. The decision has been taken: this app is
 * copied to benches inside one repair shop and goes no further, so the images
 * ship, and the app can show a technician the phone it thinks is in their hand.
 *
 * **They do not replace the diagrams.** §8's SVG set exaggerates the one detail
 * a question turns on and stays legible at 120 px; a photograph does neither,
 * which is why questions still ask with drawings. Photographs appear only where
 * the app has stopped asking and is showing an answer — the result screen, and
 * a group small enough for the shots to be compared side by side (§4.5).
 *
 * The mapping is by file name, so adding a model means dropping
 * `reference/images/apple/<id>.jpg` beside the others and re-running the
 * transcription; nothing here needs editing. A test pins all 37 to a photo, so
 * a missing file fails CI rather than leaving one model with a blank frame.
 */
import type { IPhoneModel, ModelId } from '../data/types.ts'

/**
 * Every JPEG in the Apple reference set, as built asset URLs.
 *
 * Eager rather than lazy: 37 photographs at roughly 3 MB total is the whole
 * image budget of an offline app that never fetches anything, and a lazy glob
 * would trade that for a promise per model and a flicker at the moment the
 * technician most wants to look. `?url` keeps them as files Vite copies and
 * fingerprints rather than inlining into the bundle.
 */
const assets: Record<string, string> = import.meta.glob(
  // One shot per model, so the extra angles the reference set carries — today
  // `iphone-air-rear.jpg` — stay out of the build rather than shipping as
  // weight nothing renders.
  ['../../reference/images/apple/*.{jpg,webp}', '!**/*-rear.*'],
  { eager: true, query: '?url', import: 'default' },
)

/**
 * File paths keyed by their base name, e.g. `iphone-13-pro` → the asset URL.
 *
 * Pure and separately tested, because the glob is the part that cannot be
 * exercised in isolation and this is the part that can be wrong: a shortening
 * or a stray directory would silently key a photo under a name no model has,
 * and the screen would show nothing rather than fail.
 */
export function photosByName(sources: Record<string, string>): Record<string, string> {
  const byName: Record<string, string> = {}
  for (const [file, url] of Object.entries(sources)) {
    // Any extension: §8 allows WebP as well as JPEG, and a format swap in the
    // reference set should not need this file edited to keep working.
    const name = file
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '')
    if (name) byName[name] = url
  }
  return byName
}

const byName = photosByName(assets)

/**
 * The photograph for a model, or `undefined`.
 *
 * Undefined is a real case rather than a defect: a model lands in `models.ts`
 * the moment its reference file does, which may be before anyone has downloaded
 * its picture. Callers render the name alone rather than a broken frame, and a
 * test fails so it does not stay that way.
 */
export function photoFor(id: ModelId): string | undefined {
  return byName[id]
}

/**
 * Alt text for a product shot.
 *
 * Names the model and says what the picture is of. The shots are Apple's
 * buy-flow renders — one device, back and front, on white — so a reader who
 * cannot see it loses nothing but the shape, and the entry behind every one of
 * these photos describes that shape in words (§4.6).
 */
/**
 * Every name the built set carries, for the test that pins it to the matrix.
 *
 * The pinning goes both ways on purpose. A model with no photo shows a blank
 * where the picture should be; a photo with no model ships as weight nothing
 * renders — the second angles are excluded by the glob above, and this is what
 * proves the exclusion still holds after someone adds a file.
 */
export function photoNames(): string[] {
  return Object.keys(byName)
}

export function photoAlt(model: IPhoneModel): string {
  return `${model.name}, back and front`
}

/**
 * How many candidates a screen may show photographs for.
 *
 * Four fit across a phone at a width where the bodies are still comparable; a
 * fifth makes them thumbnails of something. Above the limit the screen lists
 * names, which is what the strip already does better.
 */
export const PHOTO_LIMIT = 4

/**
 * Whether a screen showing `count` candidates should show their photographs.
 *
 * §12 objected to a standing wall of model photos, and the objection holds:
 * a picture invites matching the phone against it instead of answering the
 * question, which is the failure mode §1 opens with. The answer is *when*, not
 * *whether* — photographs appear once the app has stopped asking and is showing
 * what it concluded, where matching against the picture is exactly the job.
 */
export function showsPhotos(count: number): boolean {
  return count > 0 && count <= PHOTO_LIMIT
}
