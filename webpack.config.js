const webpack = require('webpack');
const { join } = require('path');

const config = env => {
  return {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: join(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: 'rclone'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [join(__dirname, 'src')],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  };
};

module.exports = config;
