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
      utils: path.resolve(__dirname, "src/utils"),
      chips: path.resolve(__dirname, "src/chips"),
      circuits: path.resolve(__dirname, "src/circuits"),
      components: path.resolve(__dirname, "src/components"),
      ports: path.resolve(__dirname, "src/ports"),
      rom: path.resolve(__dirname, "src/rom"),
      test: path.resolve(__dirname, "test"),
    },
  },
}
