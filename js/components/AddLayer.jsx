/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import ol from 'openlayers';
import RaisedButton from 'material-ui/lib/raised-button';
import UploadIcon from 'material-ui/lib/svg-icons/file/file-upload';
import Dialog from 'material-ui/lib/dialog';
import Dropzone from 'react-dropzone';
import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
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
  closebuttontext: {
    id: 'addlayer.closebuttontext',
    description: 'Title of the close button',
    defaultMessage: 'Close'
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
 *
 * ```xml
 * <AddLayer map={map} />
 * ```
 */
@pureRender
class AddLayer extends React.Component {
  constructor(props) {
    super(props);
    this._formats = {
      'geojson': new ol.format.GeoJSON(),
      'json': new ol.format.GeoJSON(),
      'kml': new ol.format.KML({extractStyles: false}),
      'gpx': new ol.format.GPX()
    };
    this._counter = 0;
    this.state = {
      open: false
    };
  }
  _showDialog() {
    this.setState({open: true});
  }
  _closeDialog() {
    this.setState({open: false});
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
                features: features,
                wrapX: false
              }),
              title: filename,
              isRemovable: true,
              isSelectable: true
            });
            map.addLayer(lyr);
            var extent = lyr.getSource().getExtent();
            var valid = true;
            for (var i = 0, ii = extent.length; i < ii; ++i) {
              var value = extent[i];
              if (Math.abs(value) == Infinity || isNaN(value) || (value < -20037508.342789244 || value > 20037508.342789244)) {
                valid = false;
                break;
              }
            }
            if (valid) {
              map.getView().fit(extent, map.getSize());
            }
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
    var actions = [
      (<RaisedButton label={formatMessage(messages.applybuttontext)} onTouchTap={this._readVectorFile.bind(this)} />),
      (<RaisedButton label={formatMessage(messages.closebuttontext)} onTouchTap={this._closeDialog.bind(this)} />)
    ];
    return (
      <RaisedButton {...this.props} icon={<UploadIcon />} label={formatMessage(messages.menutext)} onTouchTap={this._showDialog.bind(this)}>
        <Dialog autoScrollBodyContent={true} actions={actions} open={this.state.open} onRequestClose={this._closeDialog.bind(this)} modal={true} title={formatMessage(messages.modaltitle)}>
          <GridList cols={3} cellHeight={350}>
            <GridTile>
              <label>{formatMessage(messages.dropzonelabel)}</label>
              <Dropzone className='dropzone' multiple={false} onDrop={this._onDrop.bind(this)}>
                <div>{formatMessage(messages.dropzonehelp)}</div>
              </Dropzone>
            </GridTile>
            <GridTile>
              <label>{formatMessage(messages.strokecolorlabel)}</label>
              <ColorPicker onChangeComplete={this._onChangeStroke.bind(this)} color='#452135' />
            </GridTile>
            <GridTile>
              <label>{formatMessage(messages.fillcolorlabel)}</label>
              <ColorPicker onChangeComplete={this._onChangeFill.bind(this)} color='#452135' />
            </GridTile>
          </GridList>
        </Dialog>
      </RaisedButton>
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
  style: {
    margin: '10px 12px'
  },
  strokeWidth: 2,
  pointRadius: 7
};

export default injectIntl(AddLayer);
