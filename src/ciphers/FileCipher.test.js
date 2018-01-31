import FileCipher from './FileCipher';
import { Rclone } from '../rclone';

import fs from 'fs';
import chunker from 'stream-chunker';
import streamEqual from 'stream-equal';

const key = {
  // password: 'UmyLSdRHfew6aual28-ggx78qHqSfQ',
  // salt: 'Cj3gLa5PVwc2aot0QpKiOZ3YEzs3Sw'
  // prettier-ignore
  dataKey: new Uint8Array([
      141, 221, 255,  96, 210,  69,  65, 244,  71, 146, 103, 
       45, 248, 199, 117, 104,  63, 158, 208,  37, 247, 132,  
       60,  19,  21, 123,  90, 106,  38, 191, 116, 151
    ])
};

const cipher = FileCipher(key);

test('dataKey is needed', () => {
  expect(() => {
    FileCipher();
  }).toThrowErrorMatchingSnapshot();
});

test('decrypt full stream', done => {
  const decryptedStream = cipher.createReadStream(
    createFielStreamFactory(getPath('test'))
  );

  const compareStream = fs.createReadStream(getPath('test.png'));

  streamEqual(decryptedStream, compareStream, (err, equal) => {
    if (err) done.fail(err);
    expect(equal).toBeTruthy();
    done();
  });
});

test('provide random access in stream', done => {
  const randomAccess = {
    start: 200
  };

  const decryptedStream = cipher.createReadStream(
    createFielStreamFactory(getPath('test')),
    randomAccess
  );

  const compareStream = fs.createReadStream(getPath('test.png'), randomAccess);

  streamEqual(decryptedStream, compareStream, (err, equal) => {
    if (err) done.fail(err);
    expect(equal).toBeTruthy();
    done();
  });
});

test('random access over block boundary', done => {
  const randomAccess = {
    start: FileCipher.blockSize + 20
  };
  const decryptedStream = cipher.createReadStream(
    createFielStreamFactory(getPath('nonceTest')),
    randomAccess
  );

  const compareStream = fs.createReadStream(
    getPath('nonceTest.decrypted'),
    randomAccess
  );

  streamEqual(decryptedStream, compareStream, (err, equal) => {
    if (err) done.fail(err);
    expect(equal).toBeTruthy();
    done();
  });
});

test('fail on wrong magic word', done => {
  cipher
    .createReadStream(createFielStreamFactory(getPath('test.png')))
    .once('data', data => {
      done.fail("We don't want data to be read here");
    })
    .once('error', err => {
      expect(err).toMatchSnapshot();
      done();
    });
});

test('fail if decryption is not possible', done => {
  const wrongCipher = FileCipher({
    dataKey: new Uint8Array(32)
  });
  wrongCipher
    .createReadStream(createFielStreamFactory(getPath('test')))
    .once('data', data => {
      done.fail("We don't want data to be read here");
    })
    .once('error', err => {
      expect(err).toMatchSnapshot();
      done();
    });
});

test('calculate decrpyted size', () => {
  // prettier-ignore
  const cases = [
        [0, 32],
		[1, 32 + 16 + 1],
		[65536, 32 + 16 + 65536],
        [65537, 32 + 16 + 65536 + 16 + 1],
        [1 << 30, 32 + 16384 * (16 + 65536)],
        [1 << 20, 32 + 16 * (16 + 65536)],
        [(1 << 20) + 65535, 32 + 16*(16+65536) + 16 + 65535],
        // This is to big for JS
        // [(1 << 40) + 1, 32 + 16777216 * (16 + 65536) + 16 + 1]
    ];

  cases.forEach(item => {
    expect(cipher.calculateDecryptedSize(item[1])).toEqual(item[0]);
  });
});

function createFielStreamFactory(url) {
  return opts =>
    fs
      .createReadStream(url, opts)
      .pipe(chunker(opts.chunkSize, { flush: true }));
}

function getPath(name) {
  return __dirname + '/__fixtures__/FileCipher/' + name;
}
