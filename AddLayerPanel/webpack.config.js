var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var loaders = [
  {
      "test": /\.js?$/,
      "exclude": /node_modules/,
      "loader": "babel",
      "query": {
          "presets": [
              "es2015",
              "react",
              "stage-0"
          ],
          "plugins": []
      }
  }
  ,{
      "test": /\.scss$/,
      "loader": ExtractTextPlugin.extract('style-loader','css-loader!sass-loader')
  }
  , {
      "test": /\.css?$/,
      "loader": "style-loader!css-loader"
  }
  ,
  {
      "test": /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      "loader": "url-loader?limit=10000&mimetype=application/font-woff"
  }, {
      "test": /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      "loader": "file-loader"
  }

];

module.exports = {
  devtool: 'eval-source-map',
  entry: path.resolve('src', 'main.js'),
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'index.tpl.html'),
      inject: 'body',
      filename: 'index.html'
    })
  ],
  module: {
    loaders: loaders
  }
};
