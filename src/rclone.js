import scrypt from 'scrypt-js';
import { reveal } from './reveal.js';

import {
  keySize,
  fileMagic,
  fileMagicSize,
  fileNonceSize,
  fileHeaderSize,
  blockHeaderSize,
  blockDataSize,
  blockSize,
  defaultSalt
} from './constants';

function Rclone({ password, salt } = {}) {
  return new Promise((resolve, reject) => {
    if (password === undefined || salt === undefined) {
      reject(new Error('Both password and salt must be specified'));
    }
    try {
      generateKeys(password, salt, (error, keys) => {
        resolve(fromKeys(keys));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function fromKeys(keys) {
  // Streaming file decryptor
  // Takes a function createReadStream function which represents the
  // encrypted file.
  //
  // createReadStream(options)
  // Options:
  //     start: Start offset where the stream needs to beginn
  //     chunkSize: needs to be a multiple of createReadStreamFactory.blockSize
  function createReadStreamFactory(createReadStream) {
    return createReadStreamFactoryInternal(createReadStream, keys.dataKey);
  }

  createReadStreamFactory.chunkSize = blockSize;

  return keys;
}

export { Rclone };

// pass and salt are still encrypted with the rclone config encryption
function generateKeys(encPass, encSalt, callback) {
  const password = reveal(encPass);
  const decryptedSalt = reveal(encSalt);
  const salt = decryptedSalt.length ? decryptedSalt : defaultSalt;
  
  if (password.length === 0) {
    // Empty key for testing
    callback(
      null,
      createKeysFromKey(encPass, encSalt, new Array(keySize).fill(0))
    );
  } else {
    scrypt(password, salt, 16384, 8, 1, keySize, (error, progress, key) => {
      if (error) callback(error, null);
      if (key) {
        callback(null, createKeysFromKey(encPass, encSalt, key));
      }
    });
  }
}

function createKeysFromKey(encPass, encSalt, key) {
  return {
    password: encPass,
    salt: encSalt,
    dataKey: new Uint8Array(key.slice(0, 32)),
    nameKey: new Uint8Array(key.slice(32, 64)),
    nameTweak: new Uint8Array(key.slice(64))
  };
}
