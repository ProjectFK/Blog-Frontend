let path = require('path');
let VueLoaderPlugin = require('vue-loader/lib/plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let CleanerPlugin = require('clean-webpack-plugin');
let OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let WebpackCdnPlugin = require('webpack-cdn-plugin');
let WebpackSubresourceIntegrityPlugin = require('webpack-subresource-integrity');

let config = {

    context: path.resolve(__dirname, 'src'),

    entry: {
        login: './login/app.js',
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name]/[name].bundle[hash:5].js',
        crossOriginLoading: 'anonymous',
    },

    module: {

        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015']
                        }
                    }
                ]
            },

            {
                test: /\.html$/,
                use: ['html-loader']
            },

            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },

            {
                test: /\.vue$/,
                use: [
                    'vue-loader'
                ]
            },

            {
                test: /\.(jpe?g|png)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash:5].webp',
                            outputPath: 'image/',
                        }
                    },
                    {
                        loader: 'webp-loader'
                    },
                ]
            },

            {
                test: /\.webp$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[hash:5].[ext]',
                            outputPath: 'image/',
                        }
                    }
                ]
            },

            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096,
                            name: '[name].[hash:5].[ext]',
                            outputPath: 'image/',
                        }
                    }
                ]
            }

        ]
    },

    plugins: [
        //Vue loader
        new VueLoaderPlugin(),

        //Extract html file
        new HtmlWebpackPlugin({
            template: 'login/index.html',
            filename: 'login/index.html'
        }),

        //Extract css as file
        new MiniCssExtractPlugin({
            filename: '[name]/[name].style[hash:5].css'
        }),

        //Directory cleaner
        new CleanerPlugin(['build']),

        new WebpackCdnPlugin({
            modules: [
                {
                    name: 'vue',
                    var: 'Vue',
                },
            ],
            prodUrl: 'https://cdn.jsdelivr.net/npm/:name@:version/:path'
        }),

        new WebpackSubresourceIntegrityPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: true
        }),
    ],

};

module.exports = (env, argv) => {

    const isDev = argv === undefined || argv.mode === 'production';

    if (isDev) {
        config.mode = 'development';
    } else {
        config.mode = 'production';
        config.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                }),
                new OptimizeCSSAssetsPlugin()
            ]
        };
    }

    console.log(
        "\n\nBuilding with " + config.mode + " mode:\n\nConfig is following:\n\n" + JSON.stringify(config) + "\n\n"
    );

    return config;
};