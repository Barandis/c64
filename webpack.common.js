/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const path = require("path")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "lib"),
    library: "c64",
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    alias: {
      index: path.resolve(__dirname, "src/index.js"),
      utils: path.resolve(__dirname, "src/utils.js"),
      circuits: path.resolve(__dirname, "src/circuits"),
      chips: path.resolve(__dirname, "src/chips"),
      data: path.resolve(__dirname, "src/data"),
      test: path.resolve(__dirname, "test"),
    },
  },
}
