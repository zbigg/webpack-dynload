const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DynamicLoadMetaPlugin } = require("./DynamicLoadMetaPlugin");

const htmlWebpackPluginOptions = {
  template: "./index.html",
  // inject: false,
  placeHolder: {},
  chunks: ["index"],
};

module.exports = {
  devtool: false,
  // mode: "development",
  mode: "production",
  entry: {
    index: "./src/index.js",
    xz: ["./src/x.js", "./src/z.js"],
    y: "./src/y.js",
  },
  output: {
    filename: "js/[name]-[contenthash].js",
    // filename: "[name].js",
    path: __dirname + "/dist",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
    },
    runtimeChunk: "single",
  },

  plugins: [
    new DynamicLoadMetaPlugin({
      placeHolder: htmlWebpackPluginOptions.placeHolder,
    }),
    new HtmlWebpackPlugin(htmlWebpackPluginOptions),
    new WebpackManifestPlugin()
  ],
};
