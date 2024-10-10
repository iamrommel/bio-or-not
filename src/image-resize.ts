import { createCanvas, Image, loadImage } from 'canvas' // Import canvas to resize the image
import * as tf from '@tensorflow/tfjs-node'

// Load and resize the image
async function loadImageAndResize(image: Image) {
  // Create a canvas to resize the image
  const canvas = createCanvas(224, 224)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, 224, 224) // Resize to 224x224

  // Convert the canvas to a tensor
  const imageTensor = tf.browser
    .fromPixels(canvas as unknown as HTMLCanvasElement)
    .toFloat()
    .div(tf.scalar(255)) // Normalize the image
  return imageTensor
}
