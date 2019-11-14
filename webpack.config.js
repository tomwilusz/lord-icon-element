const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        'lord-icon': path.resolve(__dirname, 'release', 'lord-icon'),
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bin'),
    },

    resolve: {
        extensions: [ '.js' ],
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