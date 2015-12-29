import React from 'react';
import ol from 'openlayers';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Dialog from 'pui-react-modals';
import Dropzone from 'react-dropzone';
import Grids from 'pui-react-grids';
import {transformColor} from '../util.js';
import ColorPicker from 'react-color';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './AddLayer.css';

const ID_PREFIX = 'sdk-addlayer-';

const messages = defineMessages({
  menutitle: {
    id: 'addlayer.menutitle',
    description: 'Title of the menu button',
    defaultMessage: 'Add layer'
  },
  menutext: {
    id: 'addlayer.menutext',
    description: 'Text of the menu button',
    defaultMessage: 'Upload'
  },
  modaltitle: {
    id: 'addlayer.modaltitle',
    description: 'Title of the modal dialog for add layer',
    defaultMessage: 'Upload layer'
  },
  dropzonelabel: {
    id: 'addlayer.dropzonelabel',
    description: 'Label for the drag and drop zone for files',
    defaultMessage: 'File'
  },
  dropzonehelp: {
    id: 'addlayer.dropzonehelp',
    description: 'Help text for the drag and drop zone for files',
    defaultMessage: 'Drop a KML, GPX or GeoJSON file here, or click to select it.'
  },
  strokecolorlabel: {
    id: 'addlayer.strokecolorlabel',
    description: 'Label text for the stroke color colorpicker',
    defaultMessage: 'Stroke color'
  },
  fillcolorlabel: {
    id: 'addlayer.fillcolorlabel',
    description: 'Label text for the fill color colorpicker',
    defaultMessage: 'Fill color'
  },
  applybuttontitle: {
    id: 'addlayer.applybuttontitle',
    description: 'Title of the apply button',
    defaultMessage: 'Apply'
  },
  applybuttontext: {
    id: 'addlayer.applybuttontext',
    description: 'Text of the apply button',
    defaultMessage: 'Apply'
  }
});

/**
 * Adds a menu entry that can be used by the web app user to add a layer to the map.
 * Only vector layers can be added. Supported formats for layers are GeoJSON, GPX and KML.
 */
@pureRender
class AddLayer extends React.Component {
  constructor(props) {
    super(props);
    this._formats = {
      'geojson': new ol.format.GeoJSON(),
      'json': new ol.format.GeoJSON(),
      'kml': new ol.format.KML(),
      'gpx': new ol.format.GPX()
    };
    this._counter = 0;
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
  _generateId() {
    return ID_PREFIX + this._counter;
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
              var fill = this._fillColor ? new ol.style.Fill({color: this._fillColor}) : undefined;
              var stroke = this._strokeColor ? new ol.style.Stroke({color: this._strokeColor, width: this.props.strokeWidth}) : undefined;
              style = new ol.style.Style({
                fill: fill,
                stroke: stroke,
                image: (fill || stroke) ? new ol.style.Circle({stroke: stroke, fill: fill, radius: this.props.pointRadius}) : undefined
              });
            }
            this._counter++;
            var lyr = new ol.layer.Vector({
              id: this._generateId(),
              style: style,
              source: new ol.source.Vector({
                features: features
              }),
              title: filename,
              isRemovable: true,
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
    this._strokeColor = transformColor(color);
  }
  _onChangeFill(color) {
    this._fillColor = transformColor(color);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <article>
        <UI.DefaultButton title={formatMessage(messages.menutitle)} onClick={this._showDialog.bind(this)}>
          <Icon.Icon name="upload" /> {formatMessage(messages.menutext)}
        </UI.DefaultButton>
        <Dialog.Modal title={formatMessage(messages.modaltitle)} ref="modal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              <div className="form-group">
                <Grids.Col md={8}>
                   <label>{formatMessage(messages.dropzonelabel)}</label>
                  <Dropzone className='dropzone' multiple={false} onDrop={this._onDrop.bind(this)}>
                    <div>{formatMessage(messages.dropzonehelp)}</div>
                  </Dropzone>
                </Grids.Col>
                <Grids.Col md={8}>
                  <label>{formatMessage(messages.strokecolorlabel)}</label>
                  <ColorPicker onChangeComplete={this._onChangeStroke.bind(this)} color='#452135' />
                </Grids.Col>
                <Grids.Col md={8}>
                    <label>{formatMessage(messages.fillcolorlabel)}</label>
                    <ColorPicker onChangeComplete={this._onChangeFill.bind(this)} color='#452135' />
                </Grids.Col>
              </div>
            </form>
          </Dialog.ModalBody>
          <Dialog.ModalFooter>
            <UI.DefaultButton title={formatMessage(messages.applybuttontitle)} onClick={this._readVectorFile.bind(this)}>{formatMessage(messages.applybuttontext)}</UI.DefaultButton>
          </Dialog.ModalFooter>
        </Dialog.Modal>
      </article>
    );
  }
}

AddLayer.propTypes = {
  /**
   * The ol3 map instance to add to.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The stroke width in pixels used in the style for the uploaded data.
   */
  strokeWidth: React.PropTypes.number,
  /**
   * The point radius used for the circle style.
   */
  pointRadius: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

AddLayer.defaultProps = {
  strokeWidth: 2,
  pointRadius: 7
};

export default injectIntl(AddLayer);
