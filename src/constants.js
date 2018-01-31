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
