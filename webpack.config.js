let path = require('path');
let fs = require('fs');
let version = require('./package').version;
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
let MinifyPlugin = require('babel-minify-webpack-plugin');
// Inject webp support detection script to every html
let WebpackSubresourceIntegrityPlugin = require('webpack-subresource-integrity');
// Bundle analyzer
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let config = {

    context: path.resolve(__dirname, 'src'),

    // Well... Entries
    // Logic below will automatically add HTMLPlugin about index.html within the same folder if the file exists
    entry: {
        login: './login/app.js',
        publish: './publish/app.js'
    },

    output: {
        // Distribute bundles depends on their entry name
        filename: '[name]/[name].bundle[chunkhash:5].js',
        // Cross Origin Loading attr is required by Sub-resource Integrity
        crossOriginLoading: 'anonymous',
    },

    module: {

        rules: [
            {
                // To support more browsers
                // stuff.... I hope mike will use of this feature
                test: /\.js$/,
                use: 'babel-loader'
            },

            {
                // Html-loader for webpack to understand what is HTML....
                // Work with html-webpack-plugin
                test: /\.html$/,
                use: 'html-loader'
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
                use: 'vue-loader'
            },

            {
                // Inline svg which has the size under 4096
                test: /\.(jpe?g|png|webp|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096,
                            name: '[path]/[name].[hash:5].[ext]',
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
        let pathName = 'build';
        config.output.path = path.resolve(__dirname, pathName);
        config.plugins = config.plugins.concat(new CleanerPlugin([pathName]))
    } else {
        config.mode = 'production';
        let pathName = 'dist';
        config.output.path = path.resolve(__dirname, pathName);
        config.output.publicPath = `https://cdn.jsdelivr.net/gh/ProjectFK/Blog-Frontend@${version}/${pathName}/`;
        config.optimization = {
            minimizer: [
                new MinifyPlugin(),
                new OptimizeCSSAssetsPlugin()
            ]
        };
        config.plugins = config.plugins.concat(
            new WebpackSubresourceIntegrityPlugin({
                hashFuncNames: ['sha256'],
                enabled: true
            })
        ).concat(
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'BundleReport.html',
                logLevel: 'info'
            })
        ).concat(
            new CleanerPlugin([pathName])
        )
    }

    return config;
};