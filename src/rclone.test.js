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
  const rcloneEncryptedFileName = 'ecrk8fu3e0pk86td3r634nan08';
  const rcloneDecryptedFileName = 'encrypted_file'

   Rclone({
    password: 'UmyLSdRHfew6aual28-ggx78qHqSfQ',
    salt: ''
  })
    .then(rclone => {
      const pathCipher = PathCipher(rclone);
      const decryptedString = pathCipher.decrypt(rcloneEncryptedFileName);

      expect(decryptedString).toEqual(rcloneDecryptedFileName);
      done();
    })
    .catch(err => done.fail(err));
});
