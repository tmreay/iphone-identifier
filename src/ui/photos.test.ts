import { describe, expect, it } from 'vitest'
import { models } from '../data/models.ts'
import { PHOTO_LIMIT, photoAlt, photoFor, photosByName, showsPhotos } from './photos.ts'

describe('photosByName', () => {
  it('keys each file by its base name', () => {
    expect(
      photosByName({
        '../../reference/images/apple/iphone-13-pro.jpg': '/assets/iphone-13-pro.jpg',
      }),
    ).toEqual({ 'iphone-13-pro': '/assets/iphone-13-pro.jpg' })
  })

  it('keeps extra angles under their own name rather than a model id', () => {
    // `iphone-air-rear.jpg` is a second shot of the Air, not a model. It has to
    // land somewhere harmless: keying it as `iphone-air` would silently replace
    // the front-and-back shot every screen actually shows.
    const byName = photosByName({
      '../../reference/images/apple/iphone-air.jpg': '/front.jpg',
      '../../reference/images/apple/iphone-air-rear.jpg': '/rear.jpg',
    })
    expect(byName['iphone-air']).toBe('/front.jpg')
    expect(byName['iphone-air-rear']).toBe('/rear.jpg')
  })
})

describe('photoFor', () => {
  it('has a photograph for every model in the matrix', () => {
    // The whole point of shipping the images (D-27) is that a technician who
    // reaches a result sees the phone. A model whose file was never downloaded
    // should fail here rather than show a blank frame at the bench.
    const missing = models.filter((model) => photoFor(model.id) === undefined)
    expect(missing.map((model) => model.id)).toEqual([])
  })

  it('is undefined for an id the set has no file for', () => {
    // Callers pass model ids, so this is the future-model case: a reference
    // file transcribed before anyone downloaded the picture.
    expect(photoFor('iphone-99')).toBeUndefined()
  })
})

describe('photoAlt', () => {
  it('names the model and what the picture shows', () => {
    const air = models.find((model) => model.id === 'iphone-air')
    expect(air && photoAlt(air)).toBe('iPhone Air, back and front')
  })
})

describe('showsPhotos', () => {
  it('shows them for a result and for a group small enough to compare', () => {
    expect(showsPhotos(1)).toBe(true)
    expect(showsPhotos(PHOTO_LIMIT)).toBe(true)
  })

  it('stops once the shots would be thumbnails, and has nothing to show at zero', () => {
    expect(showsPhotos(PHOTO_LIMIT + 1)).toBe(false)
    expect(showsPhotos(37)).toBe(false)
    expect(showsPhotos(0)).toBe(false)
  })
})
