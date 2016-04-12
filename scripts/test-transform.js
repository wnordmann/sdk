var through = require('through');

module.exports = function (file) {
  var data = '';
  function write(buf) { data += buf; }
  function end() {
    this.queue(data.replace(/, {withRef: true}/g, '').replace(/export default injectIntl\((.*?)\)/g, 'export default $1').replace(/<Icon.Icon name=\"(.*?)\" \/>/g, ''));
    this.queue(null);
  }
  return through(write, end);
};
