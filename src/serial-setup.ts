import { SerialPort } from 'serialport'

export function setupSerialPort(path?: string) {
  console.log('Staring the serial port.')

  const result = new SerialPort({
    path: path ?? '/dev/cu.usbmodem2101',
    baudRate: 9600,
  })

  console.log('Serial port ready.', result)

  return result
}

export function sendCommand(port: SerialPort, command: 'L' | 'R') {
  port.write(command)
}
