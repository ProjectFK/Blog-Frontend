let path = require('path');
let fs = require('fs');
// Load vue file
let VueLoaderPlugin = require('vue-loader/lib/plugin');
// Copy & Load HTML
let HtmlWebpackPlugin = require('html-webpack-plugin');
// Extract CSS as file
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Reset output directory
let CleanerPlugin = require('clean-webpack-plugin');
// Minimize CSS
let OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// Minimize JS
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// Rest decencies to cdn
let WebpackCdnPlugin = require('webpack-cdn-plugin');
// Inject webp support detection script to every html
let WebpSupportScriptInjectionPlugin = require('./WebpSupportScriptInjectionPlugin');

let config = {

    context: path.resolve(__dirname, 'src'),

    // Well... Entries
    // Logic below will automatically add HTMLPlugin about index.html within the same folder if the file exists
    entry: {
        login: './login/app.js',
        recaptcha_testing: './recaptcha_testing/app.js',
        publish: './publish/app.js'
    },

    output: {
        // Output path
        path: path.resolve(__dirname, 'build'),
        // Distribute bundles depends on their entry name
        filename: '[name]/[name].bundle[chunkhash:5].js',
        // Cross Origin Loading attr is required by Sub-resource Integrity
        crossOriginLoading: 'anonymous',
    },

    module: {

        rules: [
            {
                // Compile js to es2015 to support more browsers but allow us to use more fancy
                // stuff.... I hope mike will use this feature
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
                // Html-loader for webpack to understand what is HTML....
                // Work with html-webpack-plugin
                test: /\.html$/,
                use: ['html-loader']
            },

            {
                // To extract css out from bundle
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },

            {
                // To parse .vue files
                test: /\.vue$/,
                use: [
                    'vue-loader'
                ]
            },

            {
                // To convert all jpg/jpeg/png file to webp file for saving money!
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
                // Good enough
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
                // Inline svg which has the size under 4096
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
            },

        ]
    },

    plugins: [
        //Vue loader
        new VueLoaderPlugin(),

        //Extract css as file
        new MiniCssExtractPlugin({
            filename: '[name]/[name].style[chunkhash:5].css'
        }),

        //Directory cleaner
        new CleanerPlugin(['build']),

        // Extract vue dependency to cdn
        new WebpackCdnPlugin({
            modules: [
                {
                    name: 'vue',
                    var: 'Vue',
                },
            ],
            prodUrl: 'https://cdn.jsdelivr.net/npm/:name@:version/:path'
        }),

        // new WebpSupportScriptInjectionPlugin(),
    ],

};

// html-webpack-plugin automatically added by entry name
// Storage for auto-generated HTML Plugins
let HTMLPlugins = [];

// Discover index.html by config.entry
for (let entryName in config.entry) {
    // For the sake of not having a warming!
    if (config.entry.hasOwnProperty(entryName)) {
        let contentPath = path.dirname(config.entry[entryName]) + "/index.html";
        let b = fs.existsSync(config.context + '/' + contentPath);
        let consoleLog =
            ['Entry', entryName, 'index.html', b ? 'loaded' : 'missing', 'from content path:', contentPath].join(' ');
        console.log(consoleLog);
        if (b)
            HTMLPlugins = HTMLPlugins.concat(new HtmlWebpackPlugin({
                filename: contentPath,
                template: contentPath,
                chunks: [entryName],
            }));
    }
}

// Combine both auto-generated HTMLPlugins with actual plugins
config.plugins = HTMLPlugins.concat(config.plugins);

module.exports = (env, argv) => {

    const isDev = !(argv === undefined || argv.mode === 'production');

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

    return config;
};