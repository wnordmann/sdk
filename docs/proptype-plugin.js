var reactDocs = require('react-docgen');
var fs = require('fs');

const componentInfo = {};

function generateType(type) {
  if (type.name === 'union') {
    const types = [];
    for (let i = 0, ii = type.value.length; i < ii; ++i) {
      types.push(generateType(type.value[i])[0]);
    }
    return types;
  } else if (type.name === 'arrayOf') {
    return [type.name + '(' + type.value.name + ')'];
  } else {
    return [type.name];
  }
}

function getSubprops(prop) {
  if (prop.type && prop.type.name === 'shape') {
    const subProps = [];
    for (let key in prop.type.value) {
      const member = prop.type.value[key];
      subProps.push({
        name: key,
        description: member.description,
        optional: !member.required,
        type: {names: [member.name]}
      });
    }
    return subProps;
  }
}

exports.handlers = {
    fileBegin: function(e) {
      const filename = e.filename;
      if (filename.indexOf('component') !== -1) {
        filename.substr(filename.indexOf('src/')+4, filename.indexOf('.js')-(filename.indexOf('src/')+4));
        const start = filename.indexOf('src/') + 4;
        const end = filename.indexOf('.js') - start;
        const module = `module:${e.filename.substr(start, end)}`;
        componentInfo[module] = reactDocs.parse(fs.readFileSync(e.filename), reactDocs.resolver.findAllComponentDefinitions);  
      }
    },
    newDoclet: function(e) {
      if (e.doclet ){
        const doclet = e.doclet;
        const info = componentInfo[doclet.longname];
        if (info) {
          doclet.properties = [];
          for (let i = 0, ii = info.length; i < ii; ++i) {
            if (info[i].props) {
              for (let key in info[i].props) {
                const prop = info[i].props[key];
                doclet.properties.push({
                  name: key,
                  optional: !prop.required,
                  description: prop.description,
                  defaultvalue: prop.defaultValue ? prop.defaultValue.value : undefined,
                  type: {names: prop.type ? generateType(prop.type) : undefined},
                  subprops: getSubprops(prop),
                });
              }
            }
          }
        }
      }
    }
};
