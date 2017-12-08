const webpack = require('webpack');
const path = require('path');
const common  = require('./webpack-common');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const entry = common.getEntries(false);

const config = {
  resolve: {
    alias: {
      '@boundlessgeo/sdk': path.resolve(__dirname, 'src/'),
    },
  },
  // Entry points to the project
  entry: entry,
  devtool: 'source-map',
  node: {fs: "empty"},
  output: {
    path: __dirname, // Path of output file
    // [name] refers to the entry point's name.
    filename: 'build/hosted/examples/[name]/[name].bundle.js',
  },
  plugins: [
    new ExtractTextPlugin('build/hosted/examples/sdk.css'),
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        compress: {
          warnings: false,
          comparisons: false,  // don't optimize comparisons
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      }, {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', {
            loader: 'sass-loader',
            options: {
              includePaths: ['node_modules'],
            }
          }],
        }),

      }
    ],
  },
};

module.exports = config;
