import { default as decodeBase32 } from 'base32-decode';
import { default as encodeBase32 } from 'base32-encode';
import { decodeBase64, encodeBase64, toSafeForFileName, toNormal } from '../utils/base64';

const encodings = {
  base32: {
    encode: (data) => encodeBase32(data, 'RFC4648-HEX').replace(/=+$/, '').toLowerCase(),
    decode: (data) => decodeBase32(data.toUpperCase(), 'RFC4648-HEX')
  },
  base64: {
    encode: (data) => toSafeForFileName(encodeBase64(data)),
    decode: (data) => decodeBase64(toNormal(data))
  }
}

export default (encodingType) => {
  const e = encodings[encodingType]

  if (!e) throw new Error('Unsupported path encoding types');
  return e
}