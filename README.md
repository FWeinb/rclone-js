rclone-js
[![Travis Build](https://img.shields.io/travis/FWeinb/rclone-js.svg?style=flat-square)](https://travis-ci.org/FWeinb/rclone-js)
[![Codecov](https://img.shields.io/codecov/c/github/FWeinb/rclone-js.svg?style=flat-square)](https://codecov.io/gh/FWeinb/rclone-js)
====

Pure Javascript implementation of the cipher used in rclone (crypt-mount).

# Installation

## Node

```
npm install rclone
```

## Browser 

You can find a browser bundle here:
[https://unpkg.com/rclone/dist/rclone.umd.min.js](https://unpkg.com/rclone/dist/rclone.umd.min.js)  
Use `window.rclone.Rclone` to access the constructor function. 

# Getting Started

## Examples

### Encrypt/Decrypt Paths

```js
import { Rclone } from 'rclone';

// Create Rclone instance 
Rclone({
    password: 'UmyLSdRHfew6aual28-ggx78qHqSfQ',
    salt: 'Cj3gLa5PVwc2aot0QpKiOZ3YEzs3Sw'
})
.then(rclone => { 
   
  // Decryption
  console.log(
    rclone.Path.decrypt("dk7voi2247uqbgbuh439j13eo0/p0q5lhi767fsplsdjla7j7uv60") // Hello World
  );
  
  // Encryption
  console.log(
    rclone.Path.encrypt("Hello/World") // dk7voi2247uqbgbuh439j13eo0/p0q5lhi767fsplsdjla7j7uv60
  );
  
})
.catch(error => {
  // Catch error creating rclone instance 
})
```

### Decrypt Files

#### Concept 

To decrypt files in the browser rclone-js is using a node concept called [Streams](https://nodejs.org/api/stream.html) in the browser using [readable-stream](https://github.com/nodejs/readable-stream). You can create a decrypting [ReadableStream](https://nodejs.org/api/stream.html#stream_readable_streams) by using the function `rclone.File.createReadStream` which will take a function that needs to return a ReadableStream representing the decrypted file. To provide random access rclone will pass an options object to the function like used by the node [`fs`](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options) module. An important additon to these options is the `chunkSize` propertie, it is needed because rclone uses a block cipher and can only operate on a integer multiple of this size. These options need to be taken into account for the creation of the underyling ReadableStream returned from the function. 

#### Example

##### [Fetch Stream](https://codesandbox.io/s/w0l01oopl5)
> Using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [range headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range) to decrypt files from amazon s3


