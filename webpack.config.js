var webpack = require('webpack');
var path = require('path');

// Vars
var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, '.');

var plugins = [
  new webpack.ProvidePlugin({
    'Intl': 'imports?this=>global!exports?global.Intl!intl'
  })
];
var filename = '[name].js';
var PROD = JSON.parse(process.env.BUILD_PROD || false);
if(PROD) {
  plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }));
  plugins.push(new webpack.optimize.UglifyJsPlugin({ compress:{ warnings: true } }));
  filename = '[name].min.js';
}


// webpack.config.js
module.exports = {
  entry: path.resolve('js', 'full.js'),
  output: {
    path: path.resolve(__dirname, "release"),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ["es2015", "react", "stage-0"]
        }
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  node: {
    fs: 'empty'
  }
};
