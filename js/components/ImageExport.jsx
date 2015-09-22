/* global ol */
import React from 'react';
import 'blueimp-canvas-to-blob';
import FileSaver from 'browser-filesaver';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';

/**
 * Export the map as a PNG file.
 */
export default class ImageExport extends React.Component {
  constructor(props) {
    super(props);
  }
  _handleClick() {
    var map = this.props.map;
    map.once('postcompose', function(evt) {
      var canvas = evt.context.canvas;
      canvas.toBlob(function (blob) {
        FileSaver.saveAs(blob, 'map.png');
      });
    });
    map.renderSync();
  }
  render() {
    return (
      <UI.DefaultButton title='Export as image' onClick={this._handleClick.bind(this)}>
        <Icon.Icon name="camera" /> Export
      </UI.DefaultButton>
    );
  }
}

ImageExport.propTypes = {
  /**
   * The ol3 map to export as PNG.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
