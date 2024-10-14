import { LayersModel } from '@tensorflow/tfjs-node'
import { Logger } from './logger'
import fs from 'fs'
import * as tf from '@tensorflow/tfjs-node'

export class TeachableMachine {
  config: { tmModelUrl: string }
  private logger: Logger = null
  public model: LayersModel = null

  constructor(tmModelUrl?: string) {
    this.config = {
      tmModelUrl: process.env.TM_MODEL_URL ?? 'https://teachablemachine.withgoogle.com/models/MKmC1_adY/',
    }
  }

  async initialize() {
    this.logger = new Logger()
    this.logger.logSource = 'Teachable Machine'

    const modelURL = `${this.config.tmModelUrl}model.json`

    this.logger.log('Star loading AI model.')
    this.model = await tf.loadLayersModel(modelURL) // Load the graph model
    this.logger.log('AI model is ready.')
  }

  async predictImage(imagePath: string) {
    if (!this.model) await this.initialize()

    const imageData = fs.readFileSync(imagePath)
    const imageTensor = tf.node.decodeImage(imageData)
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]).expandDims(0).toFloat().div(tf.scalar(255))
    const predictions = this.model.predict(resizedImage) as tf.Tensor

    const predictionArray = await predictions.data()

    const probability = predictionArray[0] // Assume the first index is biodegradable

    this.logger.log('Prediction: ', predictionArray)

    return probability
  }
}
