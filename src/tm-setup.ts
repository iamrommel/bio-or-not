import * as tf from '@tensorflow/tfjs'

// The URL to your model
const URL = 'https://teachablemachine.withgoogle.com/models/MKmC1_adY/'

// Load the model
export async function setupModel(): Promise<{ model: tf.LayersModel }> {
  const modelURL = `${URL}model.json`

  const model = await tf.loadLayersModel(modelURL) // Load the graph model
  return { model }
}

// Average predictions from multiple images
async function predictImage(frames: tf.Tensor[], model: tf.LayersModel, maxPredictions: number) {
  const predictions = await Promise.all(frames.map((frame) => model.predict(frame.expandDims(0))))

  console.log(predictions, 'Here are the predictions')
  // Sum the predictions for each class
  const totalPredictions = predictions.reduce((acc, curr) => {
    curr[0].forEach((value: number, index: number) => {
      acc[index] = (acc[index] || 0) + value // Accumulate predictions
    })
    return acc
  }, new Array(maxPredictions).fill(0))

  // Calculate the average
  return totalPredictions.map((value) => value / frames.length)
}
