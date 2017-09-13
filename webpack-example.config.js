const webpack = require('webpack');
const path = require('path');
const conf = require('./tasks/config');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(isDirectory)

const subDirs = getDirectories('./examples');

const entry = {};
for (let i = 0, ii = subDirs.length; i < ii; ++i) {
  const name = subDirs[i].split(path.sep).pop();
  if (conf.skip.indexOf(name) === -1) {
    entry[name] = [];
    entry[name].push(`.${path.sep}${subDirs[i]}${path.sep}app.js`);
  }
}

const config = {
  resolve: {
    alias: {
      '@boundlessgeo/sdk': path.resolve(__dirname, 'src/'),
    },
  },
  // Entry points to the project
  entry: entry,
  devtool: 'eval',
  node: {fs: "empty"},
  output: {
    path: __dirname, // Path of output file
    // [name] refers to the entry point's name.
    filename: 'build/hosted/examples/[name]/[name].bundle.js',
  },
  plugins: [
    new ExtractTextPlugin('build/stylesheet/sdk.css'),
    new UglifyJSPlugin()
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
