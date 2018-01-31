import { reveal } from './reveal';

test('should decrypt', () => {
  expect(reveal('UmyLSdRHfew6aual28-ggx78qHqSfQ')).toEqual(
    new Uint8Array([49, 50, 51, 52, 53, 54]) // 123456
  );
  expect(reveal('Cj3gLa5PVwc2aot0QpKiOZ3YEzs3Sw')).toEqual(
    new Uint8Array([54, 53, 52, 51, 50, 49]) // 654321
  );
});
