/* global ol */
import React from 'react';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Dialog from 'pui-react-modals';
import Dropzone from 'react-dropzone';
import Grids from 'pui-react-grids';
import ColorPicker from 'react-color-picker';
import '../../node_modules/react-color-picker/index.css';

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
  _readFile(text) {
    this._text = text;
  }
  _readVectorFile() {
    var text = this._text;
    var filename = this._fileName;
    if (text && filename) {
      var ext = filename.split('.').pop().toLowerCase();
      var format = this._formats[ext];
      var map = this.props.map;
      if (format) {
        try {
          var crs = format.readProjection(text);
          var features = format.readFeatures(text, {dataProjection: crs,
            featureProjection: map.getView().getProjection()});
          if (features && features.length > 0) {
            var style;
            if (this._strokeColor || this._fillColor) {
              style = new ol.style.Style({
                fill: this._fillColor ? new ol.style.Fill({color: this._fillColor}) : undefined,
                stroke: this._strokeColor ? new ol.style.Stroke({color: this._strokeColor}) : undefined
              });
            }
            var lyr = new ol.layer.Vector({
              style: style,
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
  }
  _onDrop(files) {
    if (files.length === 1) {
      var r = new FileReader(), file = files[0];
      var me = this;
      this._fileName = file.name;
      r.onload = function(e) {
        me._readFile(e.target.result);
      };
      r.readAsText(file);
    }
  }
  _onChangeStroke(color) {
    this._strokeColor = color;
  }
  _onChangeFill(color) {
    this._fillColor = color;
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
              <div className="form-group">
                <Grids.Col md={9}>
                  <Dropzone multiple={false} onDrop={this._onDrop.bind(this)}>
                    <div>Drop a KML, GPX or GeoJSON file here, or click to select it.</div>
                  </Dropzone>
                </Grids.Col>
                <Grids.Col md={7}>
                  <label>Stroke color</label>
                  <ColorPicker saturationWidth={100} saturationHeight={175} onChange={this._onChangeStroke.bind(this)} defaultValue='#452135' />
                </Grids.Col>
                <Grids.Col md={7}>
                    <label>Fill color</label>
                    <ColorPicker saturationWidth={100} saturationHeight={175} onChange={this._onChangeFill.bind(this)} defaultValue='#452135' />
                </Grids.Col>
              </div>
            </form>
          </Dialog.ModalBody>
          <Dialog.ModalFooter>
            <UI.DefaultButton title="Apply" onClick={this._readVectorFile.bind(this)}>Apply</UI.DefaultButton>
          </Dialog.ModalFooter>
        </Dialog.Modal>
      </article>
    );
  }
}

AddLayer.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
