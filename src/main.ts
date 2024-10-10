import { sendCommand, setupSerialPort } from './serial-setup'
import { setupModel } from './tm-setup'
import { captureFromCamera } from './camera-capture'
import * as tf from '@tensorflow/tfjs-node'
import fs from 'fs'

class App {
  model: tf.LayersModel
  serialPort: any

  async init() {
    this.serialPort = setupSerialPort()
    const { model } = await setupModel()
    this.model = model
  }

  // Predict if the image is biodegradable or non-biodegradable
  async getProbability() {
    const { imagePath } = await captureFromCamera()
    const imageData = fs.readFileSync(imagePath)
    const imageTensor = tf.node.decodeImage(imageData)
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]).expandDims(0).toFloat().div(tf.scalar(255))
    const predictions = this.model.predict(resizedImage) as tf.Tensor

    const predictionArray = await predictions.data()

    return predictionArray[0] // Assume the first index is biodegradable
  }

  async isBiodegradable() {
    const probability = await this.getProbability()
    return probability > 0.5
  }

  async check() {
    const isBiodegradable = await this.isBiodegradable()
    console.log(`Is biodegradable?: ${isBiodegradable}`)

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
  }
}

new App().main().catch((error) => console.error('An error occurred: ', error.message))
