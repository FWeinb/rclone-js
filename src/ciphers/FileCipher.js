import tweetncal from 'tweetnacl';
import through2 from 'through2';

import PushStream from './PushStream';

const { secretbox } = tweetncal;

import {
  keySize,
  fileMagic,
  fileMagicSize,
  fileNonceSize,
  fileHeaderSize,
  blockHeaderSize,
  blockDataSize,
  blockSize
} from '../constants';

function FileCipher({ dataKey } = {}) {
  if (dataKey === undefined) {
    throw new Error('dataKey must be specified');
  }

  function createReadStreamFactory(createReadStream) {
    return createReadStreamFactoryInternal(createReadStream, dataKey);
  }
  function createReadStream(createReadStream, opts) {
    return createReadStreamFactory(createReadStream)(opts);
  }

  return {
    createReadStream,
    createReadStreamFactory,
    calculateDecryptedSize
  };
}

FileCipher.blockSize = blockSize;

export default FileCipher;

function createReadStreamFactoryInternal(getEncryptedStream, key, factOpts) {
  const blockMulitples = (factOpts && factOpts.blockMulitples) || 16;
  const noncePromise = loadNonce(getEncryptedStream);
  // Decrypted Stream
  return opts => {
    const start = (opts && opts.start) || 0;

    let blockOffset = Math.floor(start / blockDataSize);
    let offsetInBlock = start % blockDataSize;

    const offset = fileHeaderSize + blockOffset * blockSize;

    // The Encrytped stream must be read
    const encrytpedStream = getEncryptedStream({
      start: offset,
      chunkSize: blockSize * blockMulitples // default 16;
    });

    return new PushStream(next => {
      noncePromise
        .then(initalNonce => {
          // Ensure that initalNonce will not be modfied
          const nonce = initalNonce.slice();

          // Advance the nonce to the blockOffset
          incrementNonceBy(nonce, blockOffset);

          encrytpedStream
            // Create a decryptor for this key and nonce
            .pipe(createCipher(key, nonce))
            .on('data', data => {
              if (offsetInBlock !== 0) {
                data = data.subarray(offsetInBlock);
                offsetInBlock = 0;
              }
              next(null, data);
            })
            .on('error', err => {
              next(err, null);
            })
            .on('end', () => {
              next(null, null);
            });
        })
        .catch(err => {
          next(err, null);
        });
    });
  };
}

function loadNonce(getEncryptedStream, key) {
  return new Promise((resolve, reject) => {
    const stream = getEncryptedStream({
      start: 0,
      end: fileHeaderSize,
      chunkSize: fileHeaderSize
    }).once('data', data => {
      const magic = data
        .subarray(0, fileMagicSize)
        .reduce((acc, i) => acc + String.fromCharCode(i), '');

      // Test if this is a valid rClone file
      if (magic !== fileMagic) {
        reject(new Error('Magic is wrong'));
      }

      const initalNonce = data.subarray(fileMagicSize);

      stream.destroy();

      // Resolve
      resolve(initalNonce);
    });
  });
}

// Operation on multiples of blockSize chunks
function createCipher(key, nonce) {
  return through2((data, enc, next) => {
    // If there is no content we can stop reading
    if (data.length === 0) {
      return next(null, null);
    }
    // Size of the decrypted data
    const decryptedSize = calculateDecryptedSize(data.length) + fileHeaderSize;

    let encryptedOffset = 0;
    let decryptedOffset = 0;
    do {
      // Read a encrypted block from the data array
      const end = encryptedOffset + blockSize;
      const part = data.subarray(encryptedOffset, end);
      // Decrypt it
      let decrypted = secretbox.open(part, nonce, key);
      if (decrypted == null) {
        return next(new Error('Could not decrypt data'), null);
      }
      // Advance Nonce
      incrementNonce(nonce);

      // Align the decrypted data in the data array
      data.set(decrypted, decryptedOffset);

      // Advance both offsets
      decryptedOffset += blockDataSize;
      encryptedOffset = end;

      // Do we need to decrypt more
    } while (decryptedOffset < decryptedSize);

    next(null, data.subarray(0, decryptedSize));
  });
}

function calculateDecryptedSize(size) {
  size = size - fileHeaderSize;
  const blocks = Math.floor(size / blockSize);
  const decryptedSize = blocks * blockDataSize;
  let residue = size % blockSize;
  if (residue !== 0) {
    residue -= blockHeaderSize;
  }
  return decryptedSize + residue;
}

// This will break for x > 2^53 because Javascript can't
// represent these numbers...
function incrementNonceBy(nonce, x) {
  if (x <= 0) return;
  let carry = 0;
  for (let i = 0; i < 8; i++) {
    const digit = nonce[i];
    const xDigit = x & 0xff;
    x = x >> 8;
    carry = carry + (digit & 0xffff) + (xDigit & 0xffff);
    nonce[i] = carry & 0xff;
    carry = carry >> 8;
  }
  if (carry != 0) {
    incrementNonce(nounce, 8);
  }
}

function incrementNonce(nonce, i = 0) {
  for (; i < nonce.length; i++) {
    const digit = nonce[i];
    nonce[i] = digit + 1;
    if (nonce[i] >= digit) {
      break;
    }
  }
}
