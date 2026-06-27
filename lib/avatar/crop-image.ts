import { isNil } from 'lodash'

/** Avatars are stored as a single square WebP at this edge length (px). */
export const AVATAR_SIZE = 256

/** Pixel crop rectangle as produced by react-easy-crop's `croppedAreaPixels`. */
export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () =>
      reject(new Error('Could not load the selected image'))
    )
    image.src = src
  })
}

function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (isNil(blob)) {
          reject(new Error('Could not encode the cropped image'))
          return
        }
        resolve(blob)
      },
      'image/webp',
      0.85
    )
  })
}

/**
 * Renders the selected crop of a source image into a square 256×256 canvas and
 * encodes it as a WebP blob, entirely client-side. Producing the final tiny file
 * in the browser avoids any server-side or Supabase image transformation cost.
 */
export async function getCroppedWebpBlob(
  imageSrc: string,
  crop: CropArea
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE

  const ctx = canvas.getContext('2d')
  if (isNil(ctx)) {
    throw new Error('Could not prepare the image for upload')
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  )

  return canvasToWebpBlob(canvas)
}
