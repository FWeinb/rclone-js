import { AES, padding } from 'aes-js';
import { default as decodeBase32 } from 'base32-decode';
import { default as encodeBase32 } from 'base32-encode';
import { Decrypt, Encrypt } from './eme';
import { TextDecoder, TextEncoder } from './text-encoding';

const { pkcs7 } = padding;

const decodeUTF8 = (() => {
  const decoder = new TextDecoder('utf-8');
  return data => decoder.decode(new Uint8Array(data));
})();

const encodeUTF8 = (() => {
  const encoder = new TextEncoder('utf-8');
  return data => encoder.encode(data);
})();

export default function PathCipher({ nameKey, nameTweak } = {}) {
  if (nameKey === undefined || nameTweak === undefined) {
    throw new Error('nameKey and nameTweak must be specified');
  }
  // Name Cipher Fuctions
  const nameCipher = new AES(nameKey);

  function encryptName(name) {
    const ciphertext = encodeUTF8(name);
    const paddedCipherText = pkcs7.pad(ciphertext);
    const rawCipherText = Encrypt(nameCipher, nameTweak, paddedCipherText);

    let encodedCipher = encodeBase32(rawCipherText, 'RFC4648-HEX');
    return encodedCipher.replace(/=+$/, '').toLowerCase();
  }

  function encrypt(path) {
    return path
      .split('/')
      .map(encryptName)
      .join('/');
  }
  function decryptName(name) {
    const rawCipherText = new Uint8Array(
      decodeBase32(name.toUpperCase(), 'RFC4648-HEX')
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
