var path = require('path');
var webpack = require('webpack');
var banner = require('./src/tmBanner');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ]
};