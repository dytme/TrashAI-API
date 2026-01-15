
# TrashAI-API

Custom Backend for the [TrashAI Repository](https://github.com/opensacorg/trash-ai) using [TensorFlow JS](https://www.tensorflow.org/js) and [NodeJS](https://nodejs.org/en), which allows you to skip the included front-end of the original product and send a HTTP request, containing a .jpg image, directly to the model, in order to receive the most likely detected object.




## Usage

### Endpoint

The server listens on port 3000 for requests at the URL `/detect`. It only accepts requests that are of `Content-Type` `image/jpeg`. You can send the image in the form of a byte array, and the API will handle the required decoding and transformations for the model to analyze.

```http
  POST http://localhost:3000/detect

```

While you can send an image of any filesize, the model can only analyse resolutions up to `640x640`. As such, there's no point in providing large resolution images, as detection quality will not improve.

### Response
The API will respond exclusively with the `ClassID` of the most likely result, a String which may be connected to one of the keys of the `name-map.json` file included.

Possible responses include:
| Response    | Meaning                                                                                         |
|-------------|-------------------------------------------------------------------------------------------------|
| "-2"        | Bad Request or Model Busy. For Bad Request, you can also check the Status Code of the Response. |
| "-1"        | No object has been detected.                                                                    |
| "0" to "59" | Most likely detection. Can be looked up in name-map.json                                        |

### Example: Using Java HttpClient

```java
String detectedObject; // Key of the detected object for the name-map.json

// Make a request
HttpRequest req = HttpRequest.newBuilder()
  .uri(URI.create("http://localhost:3000/detect"))
  .header("Content-Type", "image/jpeg")
  .POST(HttpRequest.BodyPublishers.ofByteArray(imageBytes))
  .build();

// Catch the response
try {
    
  HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
  println("Connection Status: " + res.statusCode());
  detectedObject = res.body();
    
} catch (IOException e) {
  println(e);

} catch (InterruptedException e) {
  println(e);
}
```



## Deployment

### Docker (Recommended)
> ✅
>
> This deployment is compatible with both Node/CPU & JavaScript/WebGL

To deploy this project using Docker, you first have to build an image.

```bash
  docker build -t trash-ai-api . 
```

You can then run the image as a container, exposing port 3000 through:

```bash
  docker run -p 3000:3000 trash-ai-api
```


### Terminal 
> ⚠️
>
> This deployment is only for the JavaScript / WebGL release.

Keep in mind that this mode requires that you handle dependencies (like the correct version of Node) yourself. The project was built around `Node 18-slim`
For testing purposes, you can run the model using:
```bash
  npm run start-api
```
