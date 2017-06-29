var fs = require('fs');

var data = fs.readFileSync('sdk-font.css');
fs.appendFile('dist/css/components.css', data, 'utf8');
