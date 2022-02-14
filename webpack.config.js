const webpack = require("webpack");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const config = {
  entry: "./src/main.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /.js$/,
        include: new RegExp(`\\${path.sep}prebid\\.js`),
        use: {
          loader: "babel-loader",
          // presets and plugins for Prebid.js must be manually specified separate from your other babel rule.
          // this can be accomplished by requiring prebid's .babelrc.js file (requires Babel 7 and Node v8.9.0+)
          options: require("prebid.js/.babelrc.js"),
        },
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: "value",
        sourceMap: true,
      },
    }),
  ],
};

module.exports = config;
