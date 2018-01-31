let encoder, decoder;
if (typeof module === 'object' && module.exports) {
  encoder = require('ut' + 'il').TextEncoder;
  decoder = require('ut' + 'il').TextDecoder;
}
if (typeof TextDecoder === 'function') {
  decoder = TextDecoder;
  encoder = TextEncoder;
}

module.exports = {
  ['TextEncoder']: encoder,
  ['TextDecoder']: decoder
};
