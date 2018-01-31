import { Rclone } from './rclone';

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
