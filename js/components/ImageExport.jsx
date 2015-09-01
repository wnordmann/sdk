/* global ol */
import React from 'react';
import 'blueimp-canvas-to-blob';
import FileSaver from 'browser-filesaver';

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
      <li>
        <a href='#' onClick={this._handleClick.bind(this)} id='export-as-image'>
          <i className='glyphicon glyphicon-camera'></i> Export as image
        </a>
      </li>
    );
  }
}

ImageExport.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
