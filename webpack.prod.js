/* eslint-env node */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new WorkboxPlugin.GenerateSW({
      runtimeCaching: [{
        urlPattern: /\.(?:png|jpg|jpeg|svg|json|mp3|obj)$/,
        handler: 'CacheFirst',
      }],
    }),
  ]
});
