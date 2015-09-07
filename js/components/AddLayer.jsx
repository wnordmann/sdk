/* global ol */
import React from 'react';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Dialog from 'pui-react-modals';
import Dropzone from 'react-dropzone';

export default class AddLayer extends React.Component {
  constructor(props) {
    super(props);
    this._formats = {
      'geojson': new ol.format.GeoJSON(),
      'kml': new ol.format.KML(),
      'gpx': new ol.format.GPX()
    };
  }
  _showDialog() {
    this.refs.modal.open();
  }
  _closeDialog() {
    this.refs.modal.close();
  }
  _openFileDialog() {
    document.getElementById('new-layer-file-selector').click();
  }
  _readVectorFile(text, filename) {
    var ext = filename.split('.').pop().toLowerCase();
    var format = this._formats[ext];
    var map = this.props.map;
    if (format) {
      try {
        var crs = format.readProjection(text);
        var features = format.readFeatures(text, {dataProjection: crs,
          featureProjection: map.getView().getProjection()});
        if (features && features.length > 0) {
          var lyr = new ol.layer.Vector({
            source: new ol.source.Vector({
              features: features
            }),
            title: filename,
            isSelectable: true
          });
          map.addLayer(lyr);
          map.getView().fit(lyr.getSource().getExtent(), map.getSize());
          this._closeDialog();
        }
      } catch (e) {
        if (window && window.console) {
          window.console.log(e);
        }
      }
    }
  }
  _onDrop(files) {
    if (files.length === 1) {
      var r = new FileReader(), file = files[0];
      var me = this;
      var name = file.name;
      r.onload = function(e) {
        me._readVectorFile(e.target.result, name);
      };
      r.readAsText(file);
    }
  }
  render() {
    return (
      <article>
        <UI.DefaultButton title='Add layer' onClick={this._showDialog.bind(this)}>
          <Icon.Icon name="upload" /> Upload
        </UI.DefaultButton>
        <Dialog.Modal title="Upload layer" ref="modal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              <Dropzone multiple={false} onDrop={this._onDrop.bind(this)}>
                <div>Drop a KML, GPX or GeoJSON file here, or click to select it.</div>
              </Dropzone>
            </form>
          </Dialog.ModalBody>
        </Dialog.Modal>
      </article>
    );
  }
}

AddLayer.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
