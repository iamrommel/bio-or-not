import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

// Compare two images to detect changes
export async function hasSignificantChange(image1: string, image2: string): Promise<boolean> {
  // Load the images using the canvas library
  const img1 = await loadImage(image1)
  const img2 = await loadImage(image2)

  // Create canvases for both images
  const canvas1 = createCanvas(img1.width, img1.height)
  const canvas2 = createCanvas(img2.width, img2.height)
  const diffCanvas = createCanvas(img1.width, img1.height)

  const ctx1 = canvas1.getContext('2d')
  const ctx2 = canvas2.getContext('2d')
  const diffCtx = diffCanvas.getContext('2d')

  // Draw the images on their respective canvases
  ctx1.drawImage(img1, 0, 0)
  ctx2.drawImage(img2, 0, 0)

  // Get image data from both canvases
  const imgData1 = ctx1.getImageData(0, 0, img1.width, img1.height)
  const imgData2 = ctx2.getImageData(0, 0, img2.width, img2.height)
  const diffData = diffCtx.createImageData(img1.width, img1.height)

  // Compare the images and fill the diff image data
  const numDiffPixels = pixelmatch(imgData1.data, imgData2.data, diffData.data, img1.width, img1.height, { threshold: 0.5 })

  console.log('Number of pixels of difference: ', numDiffPixels)

  return numDiffPixels > 100 // If the number of differing pixels is large enough, we consider it a change
}
