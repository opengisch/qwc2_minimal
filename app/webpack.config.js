const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const styleConfig = require("./styleConfig");

const styleReplacements = Object.keys(styleConfig).map(key => ({search: "@" + key + "@", replace: styleConfig[key], flags: "g"}));
const today = new Date();
const buildDate = today.getFullYear() + "." + String(1 + today.getMonth()).padStart(2, '0') + "." + String(today.getDate()).padStart(2, '0');

module.exports = (env, argv) => {
    const isProd = argv.mode === "production";

    return {
        entry: {
            QWC2App: path.resolve(__dirname, 'js', 'app.jsx')
        },
        output: {
            hashFunction: 'sha256',
            path: path.resolve(__dirname, 'prod'),
            filename: 'dist/QWC2App.js',
            assetModuleFilename: 'dist/[hash][ext][query]'
        },
        watchOptions: {
            ignored: /node_modules(\\|\/)(?!qwc2)/
        },
        devtool: isProd ? 'source-map' : 'inline-source-map',
        optimization: {
            minimize: isProd
        },
        devServer: {
            static: [
                {
                    directory: path.resolve(__dirname, 'static'),
                    publicPath: '/'
                }
            ],
            compress: true,
            hot: true
        },
        resolve: {
            extensions: [".mjs", ".js", ".jsx"],
            fallback: {
                stream: require.resolve("stream-browserify"),
                buffer: require.resolve("buffer/"),
                path: require.resolve("path-browserify"),
                timers: require.resolve("timers-browserify"),
                url: require.resolve("url/")
            }
        },
        snapshot: {
            managedPaths: [/(.*(\\|\/)node_modules(\\|\/)(?!qwc2))/]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(argv.mode),
                    BuildDate: JSON.stringify(buildDate),
                    QWC2Version: JSON.stringify(fs.readFileSync('/qwc2/.qwc2.version.txt', 'utf8')),
                    QWC2DownloadSource: JSON.stringify(fs.readFileSync('/qwc2/.qwc2.download_source.txt', 'utf8')),
                    QWC2RepoSource: JSON.stringify(fs.readFileSync('/qwc2/.qwc2.repo_source.txt', 'utf8'))
                }
            }),
            new webpack.NormalModuleReplacementPlugin(/openlayers$/, "/qwc2/libs/openlayers"),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "index.html"),
                build: buildDate,
                hash: true
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'static' }
                ]
            })
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {loader: 'style-loader'},
                        {loader: 'css-loader'},
                        {loader: 'string-replace-loader', options: {multiple: styleReplacements}}
                    ]
                },
                {
                    test: /(.woff|.woff2|.png|.jpg|.gif|.svg)/,
                    type: 'asset/inline'
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules(\\|\/)(?!qwc2)/,
                    use: {
                        loader: 'babel-loader',
                        options: { babelrcRoots: ['.', '/qwc2', '/node_modules'] }
                    }
                },
                {
                    test: /(.mjs|.js)$/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"]
                }
            ]
        }
    };
};
