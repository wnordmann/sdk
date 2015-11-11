var browserify = require('browserify');
var watchify = require('watchify');
var through = require('through');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

function globalOl(file) {
  var data = '';
  function write(buf) { data += buf; }
  function end() {
    this.queue(data.replace("import ol from 'openlayers'", "var ol = window.ol;"));
    this.queue(null);
  }
  return through(write, end);
}

var b = browserify({
  entries: ['./js/basic.jsx'],
  debug: true,
  plugin: [watchify],
  cache: {},
  packageCache: {}
}).transform(globalOl);

var basic = './dist/js/basic-debug.js';

b.on('update', function bundle(onError) {
  var stream = b.bundle();
  if (onError) {
    stream.on('error', function(err) {
      console.log(err.message);
      process.exit(1);
    });
  }
  stream.pipe(fs.createWriteStream(basic));
});

b.bundle(function(err, buf) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  } else {
    fs.writeFile(basic, buf, 'utf-8');
    cp.fork(path.join(path.dirname(require.resolve('openlayers')),
        '../tasks/serve-lib.js'), []);
  }
});

var tabbed = './dist/js/tabbed-debug.js';

var b_tabbed = browserify({
  entries: ['./js/tabbed.jsx'],
  debug: true,
  plugin: [watchify],
  cache: {},
  packageCache: {}
}).transform(globalOl);

b_tabbed.on('update', function bundle(onError) {
  var stream = b_tabbed.bundle();
  if (onError) {
    stream.on('error', function(err) {
      console.log(err.message);
      process.exit(1);
    });
  }
  stream.pipe(fs.createWriteStream(tabbed));
});

b_tabbed.bundle(function(err, buf) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  } else {
    fs.writeFile(tabbed, buf, 'utf-8');
  }
});
