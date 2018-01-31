'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rclone = undefined;

var _scryptJs = require('scrypt-js');

var _scryptJs2 = _interopRequireDefault(_scryptJs);

var _reveal = require('./reveal.js');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Rclone() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      password = _ref.password,
      salt = _ref.salt;

  return new Promise(function (resolve, reject) {
    if (password === undefined || salt === undefined) {
      reject(new Error('Both password and salt must be specified'));
    }
    try {
      generateKeys(password, salt, function (error, keys) {
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

  createReadStreamFactory.chunkSize = _constants.blockSize;

  return keys;
}

exports.Rclone = Rclone;

// pass and salt are still encrypted with the rclone config encryption

function generateKeys(encPass, encSalt, callback) {
  var password = (0, _reveal.reveal)(encPass);
  var salt = (0, _reveal.reveal)(encSalt);
  if (password.length === 0) {
    // Empty key for testing
    callback(null, createKeysFromKey(encPass, encSalt, new Array(_constants.keySize).fill(0)));
  } else {
    (0, _scryptJs2.default)(password, salt, 16384, 8, 1, _constants.keySize, function (error, progress, key) {
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