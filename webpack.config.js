const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        'lord-icon': path.resolve(__dirname, 'scripts', 'release-entry'),
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'release'),
    },

    resolve: {
        extensions: ['.js'],
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },

    optimization: {
        minimizer: [
            new TerserPlugin(),
        ]
    }
};