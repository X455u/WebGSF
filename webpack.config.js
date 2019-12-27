/* eslint-env node */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: ["webpack/hot/dev-server", "./src/js/app.js"]
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "app.js"
  },
  devServer: {
    contentBase: path.join(__dirname, ""),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(html)$/,
        loader: "html-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html"
    })
  ]
};
