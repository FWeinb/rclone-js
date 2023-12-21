import { AES, padding } from 'aes-js';

import { Decrypt, Encrypt } from './eme';
import { TextDecoder, TextEncoder } from './text-encoding';
import PathEncoding from './path-encoding';

const { pkcs7 } = padding;

const decodeUTF8 = (() => {
  const decoder = new TextDecoder('utf-8');
  return data => decoder.decode(new Uint8Array(data));
})();

const encodeUTF8 = (() => {
  const encoder = new TextEncoder('utf-8');
  return data => encoder.encode(data);
})();

export default function PathCipher({ nameKey, nameTweak } = {}, encodingType = 'base32') {
  if (nameKey === undefined || nameTweak === undefined) {
    throw new Error('nameKey and nameTweak must be specified');
  }
  // Name Cipher Fuctions
  const nameCipher = new AES(nameKey);
  const pathEncoding = PathEncoding(encodingType)

  function encryptName(name) {
    const ciphertext = encodeUTF8(name);
    const paddedCipherText = pkcs7.pad(ciphertext);
    const rawCipherText = Encrypt(nameCipher, nameTweak, paddedCipherText);

    let encodedCipher = pathEncoding.encode(rawCipherText);
    return encodedCipher.replace(/=+$/, '');
  }

  function encrypt(path) {
    return path
      .split('/')
      .map(encryptName)
      .join('/');
  }
  function decryptName(name) {
    const rawCipherText = new Uint8Array(
      pathEncoding.decode(name)
    );
    const paddedPlaintext = Decrypt(nameCipher, nameTweak, rawCipherText);
    return decodeUTF8(pkcs7.strip(paddedPlaintext));
  }

  function decrypt(path) {
    return path
      .split('/')
      .map(decryptName)
      .join('/');
  }

  return {
    encryptName,
    decryptName,
    encrypt,
    decrypt
  };
}
