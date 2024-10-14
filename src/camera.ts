import Webcam, { WebcamOptions, FSWebcam, ImageSnapWebcam, WindowsWebcam } from 'node-webcam'
import { Logger } from './logger'
import * as process from 'node:process'
import { createCanvas, loadImage } from 'canvas'
import pixelmatch from 'pixelmatch'

export class Camera {
  private logger: Logger = null
  public camera: ImageSnapWebcam | FSWebcam | WindowsWebcam = null
  public config: WebcamOptions

  constructor() {
    this.config = {
      width: 1280,
      height: 720,
      quality: 100,
      saveShots: true,
      output: 'png',
      device: process.env.CAMERA_DEVICE ?? false,
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
  }

  initialize() {
    this.logger = new Logger()
    this.logger.logSource = 'Camera'

    this.logger.log('Staring up the camera.')

    this.camera = Webcam.create(this.config)

    this.logger.log('Camera is ready.')
  }

  getAllCameras() {
    //USB2.0 PC CAMERA
    return Webcam.list((list) => {
      this.logger.log('Cameras: ', list)
    })
  }

  async capture(fileName?: string): Promise<{ imagePath: string; data: string | Buffer }> {
    const imagePath = fileName ?? 'webcam_image.png'

    return new Promise((resolve, reject) => {
      this.camera.capture(imagePath, async (err, data) => {
        if (err) {
          this.logger.error('Error capturing image:', err)
          return reject({ error: 'Error capturing image' })
        }
        resolve({ imagePath, data })
      })
    })
  }

  async imagesHasSignificantChange(previousImage: string, currentImage: string): Promise<boolean> {
    // Load the images using the canvas library
    const img1 = await loadImage(previousImage)
    const img2 = await loadImage(currentImage)

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

    this.logger.log('Number of pixels of difference: ', numDiffPixels)

    return numDiffPixels > 100 // If the number of differing pixels is large enough, we consider it a change
  }
}
