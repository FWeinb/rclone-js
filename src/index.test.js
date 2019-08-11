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

test('should return keys using getKeys()', done => {
  Rclone({ password: '', salt: '' }).then(rclone => {
    const keys = rclone.getKeys();
    expect(keys.dataKey).toBeInstanceOf(Uint8Array);
    expect(keys.nameKey).toBeInstanceOf(Uint8Array);
    expect(keys.nameTweak).toBeInstanceOf(Uint8Array);
    expect(keys.password).toEqual('');
    expect(keys.salt).toEqual('');
    done();
  });
});
