var path = require('path');

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
    console: 'mock',
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
