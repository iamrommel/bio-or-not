import 'dotenv/config'
import { Arduino } from './arduino'
import { TeachableMachine } from './teachable-machine'
import { delay } from './delay'
import { Camera } from './camera'
import { Logger } from './logger'

class MainApp {
  teachableMachine: TeachableMachine
  arduino: Arduino
  camera: Camera
  previousImage = 'previous.png'
  currentImage = 'current.png'
  logger: Logger = null

  async initializeAll() {
    this.logger = new Logger()
    this.logger.logSource = 'BIO OR NOT'

    this.arduino = new Arduino()
    this.teachableMachine = new TeachableMachine()
    this.camera = new Camera()

    this.arduino.initializeWhenNotReady()
    await this.teachableMachine.initializeWhenNoReady()
    this.camera.initializeWhenNotReady()
  }

  // Predict if the image is biodegradable or non-biodegradable

  async main() {
    await this.initializeAll()

    // Capture the first frame as the initial "previous" image
    await this.camera.capture(this.previousImage)

    do {
      // Capture the next frame
      await this.camera.capture(this.currentImage)

      const hasChanged = await this.camera.imagesHasSignificantChange(this.previousImage, this.currentImage)

      if (hasChanged) {
        const probability = await this.teachableMachine.predictImage(this.currentImage)
        const isBiodegradable = probability > 0.5

        if (isBiodegradable) {
          this.logger.log('Biodegradable')
          this.arduino.sendCommand('L')
        } else {
          this.logger.log('Non-Biodegradable')
          this.arduino.sendCommand('R')
        }

        await delay(4000)

        //we need to capture again for the previous image, it might contain the table only
        //we need to consider also the timing of the servo
        await this.camera.capture(this.previousImage)
      }

      // Wait before capturing the next frame
      await delay(100)
    } while (true)
  }
}

new MainApp().main().catch((error) => console.error('An error occurred: ', error.message))
