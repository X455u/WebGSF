/* eslint-env node */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const WorkboxPlugin = require('workbox-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new WorkboxPlugin.GenerateSW({
      exclude: [/\.(?:png|jpg|jpeg|svg|json|mp3)$/],
      runtimeCaching: [{
        urlPattern: /\.(?:png|jpg|jpeg|svg|json|mp3)$/,
        handler: 'CacheFirst',

      }],
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ]
});
