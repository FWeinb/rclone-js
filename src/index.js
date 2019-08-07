// Simple Interface to rclone
import { Rclone as RcloneInternal } from './rclone';
import FileCipher from './ciphers/FileCipher';
import PathCipher from './ciphers/PathCipher';

export function Rclone(opts) {
  return RcloneInternal(opts).then(keys => ({
    getKeys: () => keys,
    File: FileCipher(keys),
    Path: PathCipher(keys)
  }));
}
