/* eslint-env node */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = {
  entry: {
    main: ['./src/js/app.js']
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(html)$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html'
    }),
    new WebpackPwaManifest({
      inject: false,
      fingerprints: false,

      name: 'Galactic Star Fighter',
      'short_name': 'GSF',
      'start_url': 'index.html',
      display: 'fullscreen',
      orientation: 'landscape',
      icons: [
        {
          src: 'media/touch/touch-icon-57x57.png',
          sizes: '57x57',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-76x76.png',
          sizes: '76x76',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-114x114.png',
          sizes: '114x114',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-120x120.png',
          sizes: '120x120',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: 'media/touch/touch-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        }
      ]
    })
  ]
};
