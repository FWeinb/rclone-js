// Javascript port of https://github.com/rfjakob/eme/blob/master/eme.go by rfjakob

// EME is a wide-block encryption mode developed by Halevi and Rogaway.
const DirectionEncrypt = 0;
const DirectionDecrypt = 1;

function multByTwo(out, input) {
  if (input.length !== 16) {
    throw new Error('Invalid length');
  }
  let last = input[0];

  out[0] = (2 * input[0]) & 0xff;
  if (input[15] >= 128) {
    out[0] ^= 135;
  }
  for (let j = 1; j < 16; j++) {
    const tmp = input[j];
    out[j] = (2 * input[j]) & 0xff;
    if (last >= 128) {
      out[j] = (out[j] + 1) & 0xff;
    }
    last = tmp;
  }
}

function xorBlocks(out, in1, in2) {
  if (in1.length !== in2.length && in2.length !== out.length) {
    throw new Error('Length must all match');
  }

  for (let i = 0; i < in1.length; i++) {
    out[i] = in1[i] ^ in2[i];
  }
}

function tabulateL(bc, m) {
  let Li = bc.encrypt([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const LTable = new Array(m);
  for (let i = 0; i < m; i++) {
    multByTwo(Li, Li);
    LTable[i] = Li.slice();
  }
  return LTable;
}

function aesTransform(src, direction, bc) {
  if (direction === DirectionEncrypt) {
    return bc.encrypt(src);
  } else if (direction === DirectionDecrypt) {
    const rs = bc.decrypt(src);
    return rs;
  }
}

function Transform(bc, tweak, inputData, direction) {
  // In the paper, the tweak is just called "T". Call it the same here to
  // make following the paper easy.
  const T = tweak; // in bytes

  // In the paper, the plaintext data is called "P" and the ciphertext is
  // called "C". Because encryption and decryption are virtually indentical,
  // we share the code and always call the input data "P" and the output data
  // "C", regardless of the direction.
  const P = inputData; // in bytes

  if (T.length !== 16) {
    throw new Error('Tweak must be 16 bytes long');
  }
  if (P.length % 16 !== 0) {
    throw new Error('Input Data must be a multiple of 16 long');
  }

  const m = P.length / 16;
  if (m === 0 || m > 128) {
    throw new Error(
      'EME operates on 1 to 128 block-cipher blocks, you passed ' + m
    );
  }

  // Result
  const C = new Uint8Array(P.length); // in bytes
  const LTable = tabulateL(bc, m); // in bytes

  const PPj = new Uint8Array(16); // in bytes
  for (let j = 0; j < m; j++) {
    let Pj = P.slice(j * 16, (j + 1) * 16);
    /* PPj = 2**(j-1)*L xor Pj */
    xorBlocks(PPj, Pj, LTable[j]);

    /* PPPj = AESenc(K; PPj) */
    C.set(aesTransform(PPj, direction, bc), j * 16);
  }

  /* MP =(xorSum PPPj) xor T */
  const MP = new Uint8Array(16);
  xorBlocks(MP, C.subarray(0, 16), T);
  for (let j = 1; j < m; j++) {
    xorBlocks(MP, MP, C.subarray(j * 16, (j + 1) * 16));
  }
  /* MC = AESenc(K; MP) */
  const MC = aesTransform(MP, direction, bc);

  /* M = MP xor MC */
  const M = new Uint8Array(16);
  xorBlocks(M, MP, MC);
  const CCCj = new Uint8Array(16);
  for (let j = 1; j < m; j++) {
    multByTwo(M, M);
    /* CCCj = 2**(j-1)*M xor PPPj */
    xorBlocks(CCCj, C.subarray(j * 16, (j + 1) * 16), M);
    C.set(CCCj, j * 16);
  }

  /* CCC1 = (xorSum CCCj) xor T xor MC */
  const CCC1 = new Uint8Array(16);
  xorBlocks(CCC1, MC, T);
  for (let j = 1; j < m; j++) {
    xorBlocks(CCC1, CCC1, C.subarray(j * 16, (j + 1) * 16));
  }
  C.set(CCC1, 0);

  for (let j = 0; j < m; j++) {
    /* CCj = AES-enc(K; CCCj) */
    C.set(
      aesTransform(C.subarray(j * 16, (j + 1) * 16), direction, bc),
      j * 16
    );

    const tmp = C.subarray(j * 16, (j + 1) * 16);
    /* Cj = 2**(j-1)*L xor CCj */
    xorBlocks(tmp, tmp, LTable[j]);
    C.set(tmp, j * 16);
  }
  return C;
}

export function Encrypt(bc, tweak, data) {
  return Transform(bc, tweak, data, DirectionEncrypt);
}
export function Decrypt(bc, tweak, data) {
  return Transform(bc, tweak, data, DirectionDecrypt);
}
