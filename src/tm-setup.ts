import * as tf from '@tensorflow/tfjs-node';

// The URL to your model
const URL = "https://teachablemachine.withgoogle.com/models/MKmC1_adY/";

// Load the model
export async function init() {
    const modelURL = `${URL}model.json`;
    const metadataURL = `${URL}metadata.json`;

    const model = await tf.loadGraphModel(modelURL); // Load the graph model
    const metadata = await fetch(metadataURL);
    const metaJson = await metadata.json();
    maxPredictions = metaJson['userDefinedClasses'].length; // Get the number of classes

}

