var through = require('through');

module.exports = function (file) {
  var data = '';
  function write(buf) { data += buf; }
  function end() {
    this.queue(data.replace(/, {withRef: true}/g, '').replace('export default injectIntl(DropTarget(\'layerlistitem\', layerListItemTarget, collectDrop)(DragSource(\'layerlistitem\', layerListItemSource, collect)(LayerListItem)));', 'export default LayerListItem;').replace('export default injectIntl(DragDropContext(HTML5Backend)(LayerList));', 'export default LayerList;').replace(/export default injectIntl\((.*?)\)/g, 'export default $1').replace(/<Icon.Icon name=["|{](.*?)["|}] \/>/g, 'undefined'));
    this.queue(null);
  }
  return through(write, end);
};
