
// █▀▀ ▀▄▀ ▀█▀ █▀▀ █▀█ █▄░█ ▄▀█ █░░   █▀▀ █▀█ █▀▀ █▀▄ █ ▀█▀ █▀
// ██▄ █░█ ░█░ ██▄ █▀▄ █░▀█ █▀█ █▄▄   █▄▄ █▀▄ ██▄ █▄▀ █ ░█░ ▄█


// █▀█ █▀▀ █▀█ █░█ █ █▀█ █▀▀ █▀▄▀█ █▀▀ █▄░█ ▀█▀ █▀
// █▀▄ ██▄ ▀▀█ █▄█ █ █▀▄ ██▄ █░▀░█ ██▄ █░▀█ ░█░ ▄█

tf = require('@tensorflow/tfjs'); // Load in the TensorFlow package
fs = require('fs');               // File loading system. Here to manually load in images and test the model.
jpeg = require('jpeg-js');        // Package that converts a .jpg image into raw data, for the model. Copyright (c) 2014, Eugene Ware. All rights reserved.
http = require("http");           // HTTP Module - Handles HTTP requests.

let model // Global variable for the model.





// █▀█ █░█ █▄░█   █▀▄▀█ █▀█ █▀▄ █▀▀ █░░
// █▀▄ █▄█ █░▀█   █░▀░█ █▄█ █▄▀ ██▄ █▄▄


// Possible Return Values:
    // -1 = Nothing found
    // -2 = Model is busy
    // 0-59 = Detected Object

let isBusy = false; // Debounce, to not send another request while the module is busy.

async function runModel(rawImageData) {

    if (isBusy) return -2; // If the model is busy, then return that value.

    isBusy = true; // Mark the model as busy

    console.log("Extracting data from received image.");

    // Split off the data from jpeg-js into a more readable format for tensorFlow
    const { width, height, data } = rawImageData;

    let tfImg = tf.tensor3d(data, [height, width, 3], 'float32');
        // data = actual pixels in the image
        // height, width = size of the image
        // 3 = number of channels (RGB) - directed by our specific model
        // float32 = dataType to convert the image to - directed by our specific model

    tfImg = tfImg.expandDims(0); // Add a "batch dimension" to the array-- the model can take more than one image in a batch,
                                 // but in our case we give it just one image, so we add that to the data for the model (by default it's 1)

    tfImg = tf.image.resizeBilinear(tfImg, [640, 640]); // Algorithm that resizes the image to 640x640 (what our specific model expects);

    tfImg = tfImg.toFloat() // Convert the values of the pixels (integers up until now) to floats
                        
    tfImg = tfImg.div(255.0); // Convert the normal RGB values (0-255) to floats between 0 and 1 (what the modele expects)

    console.log("Executing model...");

    const outputs = await model.executeAsync(tfImg); // Execute the model

    console.log("Model finished execution!");


    const classIds = outputs[2];             // Second option in the result array is the actual amount of objects.
    const classId = classIds.dataSync()[0];  // Model seems to be sorting the results automatically.
                                             // hence, the most likely detected object is at index 0.

    isBusy = false; // Mark model as no longer being busy!

    return classId; // Return the integer representative of the detected object.
                    // 0-59, with -1 meaning that the model found nothing.

}





const printRawData = false;

async function main() {



    // █░░ █▀█ ▄▀█ █▀▄   █▀▄▀█ █▀█ █▀▄ █▀▀ █░░
    // █▄▄ █▄█ █▀█ █▄▀   █░▀░█ █▄█ █▄▀ ██▄ █▄▄
    
    // Create an AI Model instance by giving TensorFlow the model.json file + .bin weigh data
    model = await tf.loadGraphModel('http://localhost:4000/model.json');
    console.log('model.json file loaded in succesfully.');
    


    // █▀ █▀▀ █▀█ █░█ █▀▀ █▀█   █ █▄░█ ▀█▀ █▀▀ █▀█ █▀▀ ▄▀█ █▀▀ █▀▀
    // ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄   █ █░▀█ ░█░ ██▄ █▀▄ █▀░ █▀█ █▄▄ ██▄

    const server = http.createServer(function (req, res) {

        if (req.method === "POST" && req.url === "/detect") { // Check if the request to the server is specifically a POST request (that can send data alongside it) to detect something with the model.
            
            // Check if the request contains an image or not.
            const type = req.headers["content-type"];
            if (type !== "image/jpeg") {
                res.statusCode = 400;
                return res.end("Expected image/jpeg for the model to process.");
            }

            let dataChunks = []; // Define a blank array of data chunks, where we will store the bytes of the image as they come.

            // Runs while we're still receiving data.
            req.on("data", function(chunk) {
                dataChunks.push(chunk);
            });

            // Runs if there's a connection error to the client
            req.on("error", function (errorMessage) {
                console.error("Request/Connection error: ", errorMessage);
            });

            // Runs once all of the data has been sent.
            req.on("end", async function() {
                const image = Buffer.concat(dataChunks);
                dataChunks = []; // Reset dataChunks after concating them in one single image.

                try {
                    
                    // Attempt to decode the image sent over the HTTP request.
                    const rawImageData = jpeg.decode(image, {formatAsRGBA: false});

                    console.log(rawImageData);

                    // Save the last searched image as a file.
                    let dataToEncode = {    
                        data: rawImageData,
                        width: 640,
                        height: 480,
                    };

                    let encodedImage = jpeg.encode(dataToEncode, 50);
                    fs.writeFileSync('last-image.jpg', encodedImage.data);
                    

                    // Run the model and store the result.
                    let modelResult = await runModel(rawImageData);

                    // Print that out on the server as well, as a form of debug/logging.
                    console.log('most likely object: ');
                    console.log(modelResult);

                    // Print all possible objects, not just the most likely one, and their weights.
                    if (printRawData) {
                        console.log("============= RAW DATA: ");

                        const numDet = outputs[3].dataSync()[0]; // N

                        const scores = outputs[1].dataSync().slice(0, numDet);
                        const ids = outputs[2].dataSync().slice(0, numDet);

                        console.log(numDet);
                        console.log(scores);
                        console.log(ids);
                    }

                    res.statusCode = 200;
                    return res.end(String(modelResult));


                } catch (errorMessage) {
                    console.error(errorMessage);

                    res.statusCode = 400;
                    return res.end("Invalid or corrupted JPEG image.");
                }
            });


        } else {
            res.statusCode = 404;
            return res.end("Command not found");
        }

    });

    server.listen(3000);





    

}

main();