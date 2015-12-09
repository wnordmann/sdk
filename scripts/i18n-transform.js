var through = require('through');

module.exports = function (file) {
  var data = '';
  function write(buf) { data += buf; }
  function end() {
    this.queue(data.replace(/injectIntl\((.*?)\)/g, '$1'));
    this.queue(null);
  }
  return through(write, end);
};
