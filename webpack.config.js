const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const plugins = [];
const entry = {
  rclone: './src/index.js'
};
const config = env => {
  if (env.production) {
    plugins.push(
      new (require('uglifyjs-webpack-plugin'))({
        include: /\.min\.js$/
      })
    );
    plugins.push(
      new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    );

    entry['rclone.min'] = entry.rclone;
  }

  return {
    entry,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [path.resolve(__dirname, 'src')],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        }
      ]
    },
    plugins
  };
};

module.exports = config;
