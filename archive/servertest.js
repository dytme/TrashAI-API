const http = require("http");

/*
HTTP Codes:
    200 - OK
    400 - BAD REQUEST
    404 - NOT FOUND
*/
const server = http.createServer(function (req, res) {

    if (req.method === "POST" && req.url === "/detect") { // Check if the request to the server is specifically a POST request (that can send data alongside it) to detect something with the model.
        
        // Check if the request contains an image or not.
        const type = req.headers["content-type"];
        if (type !== "image/jpeg") {
            res.statusCode = 400;
            return res.end("Expected image/jpeg for the model to process.");
        }

        const dataChunks = []; // Define a blank array of data chunks, where we will store the bytes of the image as they come.

        // Runs while we're still receiving data.
        req.on("data", function(chunk) {
            dataChunks.push(chunk);
        });

        // Runs if there's a connection error to the client
        req.on("error", function (errorMessage) {
            console.error("Request/Connection error: ", errorMessage);
        });

        // Runs once all of the data has been sent.
        req.on("end", function() {
            const image = Buffer.concat(dataChunks);

            try {
                // Decode jpeg + Tell model to run here
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