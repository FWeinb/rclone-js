import { Rclone } from './index';

test('provide access to file and path ciphers', done => {
  Rclone({
    password: '',
    salt: ''
  }).then(rclone => {
    expect(rclone).toMatchSnapshot();
    done();
  });
});
