import {SerialPort} from "serialport";

export function setupSerialPort(path?: string) {
    console.log("Staring the serial port.")

    return new SerialPort({
        path: path ??  '/dev/cu.usbmodem1101',
        baudRate: 9600,
    });


}