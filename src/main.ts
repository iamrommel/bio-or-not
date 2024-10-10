import { sendCommand, setupSerialPort } from './serial-setup'
import { setupModel } from './tm-setup'
import { captureFromCamera } from './camera-capture'
import * as tf from '@tensorflow/tfjs-node'
import fs from 'fs'
import { hasSignificantChange } from './image-match'
import { delay } from './delay'

class App {
  model: tf.LayersModel
  serialPort: any
  previousImage = 'previous.png'
  currentImage = 'current.png'

  async init() {
    this.serialPort = setupSerialPort()
    const { model } = await setupModel()
    this.model = model
  }

  // Predict if the image is biodegradable or non-biodegradable
  async getProbability() {
    const imageData = fs.readFileSync(this.currentImage)
    const imageTensor = tf.node.decodeImage(imageData)
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]).expandDims(0).toFloat().div(tf.scalar(255))
    const predictions = this.model.predict(resizedImage) as tf.Tensor

    const predictionArray = await predictions.data()

    const probability = predictionArray[0] // Assume the first index is biodegradable

    console.log('Prediction: ', predictionArray)

    return probability
  }

  async isBiodegradable() {
    const probability = await this.getProbability()
    return probability > 0.5
  }

  async check() {
    const isBiodegradable = await this.isBiodegradable()
    if (isBiodegradable) {
      console.log('Biodegradable')
      sendCommand(this.serialPort, 'L')
    } else {
      console.log('Non-Biodegradable')
      sendCommand(this.serialPort, 'R')
    }
  }

  async main() {
    await this.init()

    // Capture the first frame as the initial "previous" image
    await captureFromCamera(this.previousImage)

    do {
      // Capture the next frame
      await captureFromCamera(this.currentImage)

      const hasChanged = await hasSignificantChange(this.previousImage, this.currentImage)

      if (hasChanged) {
        await this.check()

        await delay(3000)

        //we need to capture again for the previous image, it might contain the table only
        //we need to consider also the timing of the servo
        await captureFromCamera(this.previousImage)
      }

      // Wait before capturing the next frame
      await delay(100)
    } while (true)
  }
}

new App().main().catch((error) => console.error('An error occurred: ', error.message))
