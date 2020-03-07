/* eslint-env node */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  entry: {
    main: ['webpack/hot/dev-server']
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, ''),
    compress: true,
    port: 9000
  }
});
