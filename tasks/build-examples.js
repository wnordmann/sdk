var path = require('path');

var Metalsmith = require('metalsmith');
var handlebars = require('handlebars');
var templates = require('metalsmith-layouts');
var marked = require('marked');

var srcDir = path.join(__dirname, '..', 'examples');
var destDir = path.join(__dirname, '..', 'build', 'examples');
var templatesDir = path.join(__dirname, '..', 'config', 'examples');

var isJsRegEx = /\.js$/;
var isCssRegEx = /\.css$/;

function createIndex(files, metalsmith, done) {
  setImmediate(done); // all remaining code is synchronous
  var index = '<!DOCTYPE html>';
  index += '<html>';
  index += '<head>';
  index += '<title>Boundless SDK Examples</title>';
  index += '<link rel="stylesheet" type="text/css" href="examples.css"/>';
  index += '</head>';
  index += '<body>';
  index += '<div id="header">';
  index += 'Boundless SDK Examples';
  index += '</div>';
  index += '<ul>';
  for (var filename in files) {
    var example = files[filename];
    if (filename.indexOf('index.html') !== -1 && filename.indexOf('.swp') === -1) {
      index += '<li>';
      index += `<a href="${filename}">${example.title}</a><br>`;
      index += `${example.shortdesc}`;
      index += '</li>';
    }
  }
  index += '</ul>';
  index += '</body>';
  index += '</html>';
  files['index.html'] = {
    contents: new Buffer(index),
    mode: '0644'
  };
}

function augmentExamples(files, metalsmith, done) {
  setImmediate(done); // all remaining code is synchronous
  for (var filename in files) {
    var file = files[filename];
    if (filename.indexOf('index.html') !== -1 && filename.indexOf('.swp') === -1) {
      if (!file.layout) {
        throw new Error(filename + ': Missing "layout" in YAML front-matter');
      }
      var id = filename.split(path.sep)[0];

      file.js = {
        tag: '<script src="./' + id + '.bundle.js"></script>',
      };
      var cssFilename = id + '/app.css';
      if (cssFilename in files) {
        file.css = {
          tag: '<link rel="stylesheet" href="app.css">',
        };
      }

      // add additional resources
      if (file.resources) {
        var resources = [];
        for (var i = 0, ii = file.resources.length; i < ii; ++i) {
          var resource = file.resources[i];
          if (isJsRegEx.test(resource)) {
            resources[i] = '<script src="' + resource + '"></script>';
          } else if (isCssRegEx.test(resource)) {
            resources[i] = '<link rel="stylesheet" href="' + resource + '">';
          } else {
            throw new Error('Invalid value for resource: ' +
                resource + ' is not .js or .css: ' + filename);
          }
        }
        file.extraHead = {
          local: resources.join('\n'),
        };
      }
    }
  }
}

function main(callback) {
  var smith = new Metalsmith('.')
      .source(srcDir)
      .destination(destDir)
      .concurrency(25)
      .use(augmentExamples)
      .use(createIndex)
      .use(templates({
        engine: 'handlebars',
        directory: templatesDir,
        helpers: {
          md: function(str) {
            return new handlebars.SafeString(marked(str));
          },
        },
      }))
      .build(function(err) {
        callback(err);
      });
  return smith;
}

if (require.main === module) {
  main(function(err) {
    if (err) {
      process.stderr.write(
          'Building examples failed.  See the full trace below.\n\n' +
          err.stack + '\n');
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = main;
