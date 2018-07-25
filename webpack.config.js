let path = require('path');
let VueLoaderPlugin = require('vue-loader/lib/plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let CleanerPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: "development",

    context: path.resolve(__dirname, 'src'),

    entry: {
        login: './login/app.js',
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
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
                test: /\.(jpg|png|svg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 1024,
                            name: "[name].[hash:10].[ext]",

                        }
                    }
                ]
            },

        ]
    },

    plugins: [
        //Vue loader
        new VueLoaderPlugin(),

        //Extract html file
        new HtmlWebpackPlugin({
            template: 'login/index.html'
        }),

        //Extract css as file
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),

        //Directory cleaner
        new CleanerPlugin(['build']),
    ],

};