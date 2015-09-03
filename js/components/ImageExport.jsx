/* global ol */
import React from 'react';
import 'blueimp-canvas-to-blob';
import FileSaver from 'browser-filesaver';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';

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
      <UI.DefaultButton onClick={this._handleClick.bind(this)}>
        <Icon.Icon name="camera" /> Export as image
      </UI.DefaultButton>
    );
  }
}

ImageExport.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
