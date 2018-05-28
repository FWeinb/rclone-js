import AES from 'aes-js';
const { ctr } = AES.ModeOfOperation;

// prettier-ignore
// https://github.com/ncw/rclone/blob/a3759921863f5b1c7169464170de03f47c34e0a7/fs/config/obscure/obscure.go#L17-L22
const key = [
  0x9c, 0x93, 0x5b, 0x48, 0x73, 0x0a, 0x55, 0x4d,
  0x6b, 0xfd, 0x7c, 0x63, 0xc8, 0x86, 0xa9, 0x2b,
  0xd3, 0x90, 0x19, 0x8e, 0xb8, 0x12, 0x8a, 0xfb,
  0xf4, 0xde, 0x16, 0x2b, 0x8b, 0x95, 0xf6, 0x38,
]

let ctrCipher; // Singelton
function createCipher() {
  if (ctrCipher) return ctrCipher;
  // Key extracted from rclone
  return (ctrCipher = new ctr(key, 0));
}

function reveal(cipherText) {
  const blockCipher = createCipher();

  cipherText = cipherText.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = base64(cipherText);

  const iv = bytes.subarray(0, 16);
  const buf = bytes.subarray(16);

  // I don't always want to create a new instance of
  // AES so I am reusing the ctr cipher and reseting it
  ctrCipher._counter._counter = iv;
  ctrCipher._remainingCounter = null;
  ctrCipher._remainingCounterIndex = 16;

  return ctrCipher.decrypt(buf);
}

export { reveal };

function base64(s) {
  if (s.length % 4 != 0) {
    s += '===='.substr(0, 4 - s.length % 4);
  }
  return new Uint8Array(
    atob2(s)
      .split('')
      .map(charCodeAt)
  );
}

function atob2(data) {
  return typeof atob === 'function'
    ? atob(data)
    : Buffer.from(data, 'base64').toString('binary');
}

function charCodeAt(c) {
  return c.charCodeAt(0);
}
