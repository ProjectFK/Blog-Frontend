let webpack = require('webpack');
let config = require('./webpack.config');

webpack(config(null, undefined), (err, stats) => console.error(err, stats));