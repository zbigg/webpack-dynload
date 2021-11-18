const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DynamicLoadMetaPlugin } = require("./DynamicLoadMetaPlugin");

const dynamicLoadMetaPluginResultPlaceHolder = {};

module.exports = {
    devtool: false,
    // mode: "development",
    mode: "production",
    entry: {
        index: "./src/index.js",
        xz: ["./src/x.js", "./src/z.js"],
        y: "./src/y.js"
    },
    output: {
        // filename: "js/[name]-[contenthash].js",
        filename: "[name].js",
        path: __dirname + "/dist"
    },
    optimization: {
        splitChunks: {
            chunks: "all"
            //     // minSize: 0
        },
        runtimeChunk: "single"
    },

    plugins: [
        new DynamicLoadMetaPlugin({
            placeHolder: dynamicLoadMetaPluginResultPlaceHolder
        }),
        new HtmlWebpackPlugin({
            template: "./index.html",
            placeHolder: dynamicLoadMetaPluginResultPlaceHolder,
            chunks: ["index"],
            inlineSource: ".(js|css)$"
        }),
        new WebpackManifestPlugin()
    ]
};
