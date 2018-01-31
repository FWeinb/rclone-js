import PathCipher from './PathCipher';

test('both nameKey and nameTweak are need', () => {
  expect(() => {
    PathCipher();
  }).toThrowErrorMatchingSnapshot();
});

test('shoud encrypt/decrypt file name', () => {
  const cases = [
    ['es785ret6k0hje8fkrqmu9fdus', 'Hallo World'],
    ['p0e52nreeaj0a5ea7s64m4j72s', '1'],
    ['p0e52nreeaj0a5ea7s64m4j72s/l42g6771hnv3an9cgc8cr2n1ng', '1/12'],
    [
      'p0e52nreeaj0a5ea7s64m4j72s/l42g6771hnv3an9cgc8cr2n1ng/qgm4avr35m5loi1th53ato71v0',
      '1/12/123'
    ]
  ];

  const cipher = PathCipher({
    nameKey: new Uint8Array(32),
    nameTweak: new Uint8Array(16)
  });

  cases.forEach(item => {
    expect(cipher.decrypt(item[0])).toEqual(item[1]);
  });

  cases.forEach(item => {
    expect(cipher.encrypt(item[1])).toEqual(item[0]);
  });
});
