var reactDocs = require('react-docgen');
var fs = require('fs');
var path = require('path');
var generateMarkdown = require('./generateMarkdown');

var dir = 'src/components/';
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
        var componentInfo;
        try {
          componentInfo = reactDocs.parse(src, reactDocs.resolver.findAllComponentDefinitions);
        } catch(e) {
        }
        if (componentInfo  && componentInfo[0].description !== '') {
          var name = file.split('.')[0];
          var markdown = generateMarkdown(name, componentInfo[0]);
          console.log('Writing: ' + output + name + '.md');
          if (name === 'LayerList'){
            fs.writeFileSync(output + name + '.json', JSON.stringify(componentInfo));
            console.log('Writing: ' + output + name + '.json');
          }
          fs.writeFileSync(output + name + '.md', markdown);
        }
      });
    }
  });
});
