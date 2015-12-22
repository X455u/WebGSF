/* eslint-env node */
var path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/js/app.js'
  ],
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: 'app.js'
  },
  target: 'web',
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src/js')
        ],
        test: /\.js$/,
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015']
        }
      }
    ]
  }
};
