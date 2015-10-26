var reactDocs = require('react-docgen');
var fs = require('fs');
var path = require('path')

var dir = 'js/components/';
var info = {};

fs.readdir(dir,function(err,files){
    if (err) throw err;
    var c=0;
    files.forEach(function(file){
        if (path.extname(file) === '.js' || path.extname(file) === '.jsx') {
        c++;
        fs.readFile(dir+file,'utf-8',function(err,src){
            if (err) throw err;
            var componentInfo = reactDocs.parse(src, reactDocs.resolver.findAllComponentDefinitions);
            info[dir+file] = componentInfo[0];
if (0===--c) {
    var result = JSON.stringify(info);
    fs.writeFileSync('api/info.json', result);
            }
        });
        }
    });
});

//var componentInfo = reactDocs.parse(fs.readFileSync('js/components/QGISPrint.jsx'), reactDocs.resolver.findAllComponentDefinitions);
//console.log(componentInfo);
