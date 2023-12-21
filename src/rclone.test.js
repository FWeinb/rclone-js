import { Rclone } from './rclone';
import {defaultSalt} from './constants';
import PathCipher from './ciphers/PathCipher';

test('both password and salt must be passed', done => {
  Rclone({
    password: 'hello'
  }).catch(err => expect(err).toMatchSnapshot('password and salt'), done());
});

test('derive keys from password', done => {
  Rclone({
    password: 'UmyLSdRHfew6aual28-ggx78qHqSfQ',
    salt: 'Cj3gLa5PVwc2aot0QpKiOZ3YEzs3Sw'
  })
    .then(rclone => {
      expect(rclone).toMatchSnapshot('empty key rclone');
      done();
    })
    .catch(err => done.fail(err));
});

test('use default salt when empty', done => {
  // Generated encrypted string with the use of rclone and empty salt
  const rcloneEncryptedFileNameBase32 = 'ecrk8fu3e0pk86td3r634nan08';
  const rcloneEncryptedFileNameBase64 = 'czdEP8NwM0QbrR7MMl1XAg';
  const rcloneDecryptedFileName = 'encrypted_file'

   Rclone({
    password: 'UmyLSdRHfew6aual28-ggx78qHqSfQ',
    salt: ''
  })
    .then(rclone => {
      let pathCipher = PathCipher(rclone);
      let decryptedString = pathCipher.decrypt(rcloneEncryptedFileNameBase32);
      expect(decryptedString).toEqual(rcloneDecryptedFileName);

      pathCipher = PathCipher(rclone, 'base64');
      decryptedString = pathCipher.decrypt(rcloneEncryptedFileNameBase64);
      expect(decryptedString).toEqual(rcloneDecryptedFileName);

      done();
    })
    .catch(err => done.fail(err));
});