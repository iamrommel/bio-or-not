// Configure webcam settings
import Webcam from 'node-webcam'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

export function setupCamera() {
  const webcamOpts: Webcam.WebcamOptions = {
    width: 1280,
    height: 720,
    quality: 100,
    saveShots: true,
    output: 'png',
    device: false,
    callbackReturn: 'location',
    // verbose: false,

    // // Number of frames to capture
    // // More the frames, longer it takes to capture
    // // Use higher framerate for quality. Ex: 60
    //
    // frames: 60,
    //
    // //Delay in seconds to take shot
    // //if the platform supports miliseconds
    // //use a float (0.1)
    // //Currently only on windows
    //
    // delay: 0,
  }

  // Create a webcam instance
  return Webcam.create(webcamOpts)
}

const WebcamInstance = setupCamera()
// Capture an image and analyze it
export const captureFromCamera = async (fileName?: string): Promise<{ imagePath: string; data: string | Buffer; image: Buffer }> => {
  const imagePath = fileName ?? 'webcam_image.png'

  return new Promise((resolve, reject) => {
    WebcamInstance.capture(imagePath, async (err, data) => {
      if (err) {
        console.error('Error capturing image:', err)
        return reject({ error: 'Error capturing image' })
      }
      resolve({ imagePath, data, image: fs.readFileSync(imagePath) })
    })
  })
}
