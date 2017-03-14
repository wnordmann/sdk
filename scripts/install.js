var fs = require('fs');
var path = require('path');
var components = 'src/components/';

var files = [{
  module: 'react-table',
  cssPath: '../',
  cssFile: 'react-table.css'
}, {
  module: 'c3-windows',
  cssPath: '',
  cssFile: 'c3.min.css'
}];

for (var i = 0, ii = files.length; i < ii; ++i) {
  var source = path.dirname(require.resolve(files[i].module)) + '/' + files[i].cssPath  + '/' + files[i].cssFile;
  var dest = components + files[i].cssFile;
  fs.createReadStream(source).pipe(fs.createWriteStream(dest));
}
