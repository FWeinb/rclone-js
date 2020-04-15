// Constants
export const keySize = 32 + 32 + 16;

// File Constants
export const fileMagic = 'RCLONE\x00\x00';
export const fileMagicSize = fileMagic.length;
export const fileNonceSize = 24;
export const fileHeaderSize = fileMagicSize + fileNonceSize;
export const blockHeaderSize = 16; // crypto_secretbox_BOXZEROBYTES
export const blockDataSize = 64 * 1024;
export const blockSize = blockHeaderSize + blockDataSize;
export const defaultSalt = [0xa8, 0x0d, 0xf4, 0x3a, 0x8f, 0xbd, 0x03, 0x08, 0xa7, 0xca, 0xb8, 0x3e, 0x58, 0x1f, 0x86, 0xb1];
