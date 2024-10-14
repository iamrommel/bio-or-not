import { SerialPort } from 'serialport'
import { Logger } from './logger'
import * as process from 'node:process'

export class Arduino {
  private logger: Logger = null
  public serialPort: SerialPort = null
  public config: { path: string; baudRate: number }

  constructor() {
    this.config = {
      path: process.env.ARDUINO_SERIAL_PORT ?? '/dev/cu.usbmodem2101',
      baudRate: parseInt(process.env.ARDUINO_BAUD_RATE ?? '9600'),
    }
  }

  initializeWhenNotReady() {
    if (!this.logger) {
      this.logger = new Logger()
      this.logger.logSource = 'Serial Port'
    }

    if (!this.serialPort) {
      this.logger.log('Staring the serial port.')

      this.serialPort = new SerialPort(this.config)
      this.logger.log('Serial port ready.')
    }
  }

  sendCommand(command: 'L' | 'R') {
    this.initializeWhenNotReady()

    this.serialPort.write(command)
  }
}
