var reactDocs = require('react-docgen');
var fs = require('fs');
var path = require('path');
var generateMarkdown = require('./generateMarkdown');

var dir = 'js/components/';
var output = 'docs/api/';

fs.readdir(dir, function(err, files) {
  if (err) {
    throw err;
  }
  files.forEach(function(file) {
    if (path.extname(file) === '.js' || path.extname(file) === '.jsx') {
      fs.readFile(dir + file, 'utf-8', function(err,src) {
        if (err) {
          throw err;
        }
        var componentInfo = reactDocs.parse(src, reactDocs.resolver.findAllComponentDefinitions);
        if (componentInfo[0].description !== '') {
          var name = file.split('.')[0];
          var markdown = generateMarkdown(name, componentInfo[0]);
          fs.writeFileSync(output + name + '.md', markdown);
        }
      });
    }
  });
});
