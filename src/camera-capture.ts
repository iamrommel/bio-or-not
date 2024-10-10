// Configure webcam settings
import Webcam from "node-webcam";
import path from "path";
import fs from 'fs';

const webcamOpts:  Webcam.WebcamOptions = {
    width: 3000,
    height: 2000,
    quality: 100,
    saveShots: true,
    output: 'jpeg',
    device: false,
    callbackReturn: 'location',
    verbose: false,

    // Number of frames to capture
    // More the frames, longer it takes to capture
    // Use higher framerate for quality. Ex: 60

    frames: 60,

    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows

    delay: 0,

};

// Create a webcam instance
const WebcamInstance = Webcam.create(webcamOpts);

// Capture an image and analyze it
export const capture = async (): Promise<{ imagePath: string, data: string | Buffer, image: Buffer }> => {
    return new Promise((resolve, reject) => {
        WebcamInstance.capture('./src/webcam_image.jpg', async (err, data) => {
            if (err) {
                console.error('Error capturing image:', err);
                return reject({ error: 'Error capturing image' });
            }
            const imagePath = path.join(__dirname, 'webcam_image.jpg');
            resolve({imagePath, data,  image:  fs.readFileSync(imagePath)})

        });
    });
};


