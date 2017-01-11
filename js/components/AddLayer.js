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
import Snackbar from 'material-ui/Snackbar';
import Button from './Button';
import UploadIcon from 'material-ui/svg-icons/file/file-upload';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Dialog from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import {GridList, GridTile} from 'material-ui/GridList';
import util from '../util';
import ColorPicker from 'react-color';
import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './AddLayer.css';

const ID_PREFIX = 'sdk-addlayer-';

const messages = defineMessages({
  errormsg: {
    id: 'addlayer.errormsg',
    description: 'Error message to show when reading features fails',
    defaultMessage: 'There was an error reading your file. ({msg})'
  },
  waitmsg: {
    id: 'addlayer.waitmsg',
    description: 'Wait message to show when reading features',
    defaultMessage: 'Please wait while your dataset is processed ...'
  },
  menutext: {
    id: 'addlayer.menutext',
    description: 'Text of the menu button',
    defaultMessage: 'Upload'
  },
  menutitle: {
    id: 'addlayer.menutitle',
    description: 'Title of the menu button',
    defaultMessage: 'Upload local vector file to application'
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
  closebuttontitle: {
    id: 'addlayer.closebuttontitle',
    description: 'Tooltip for close button',
    defaultMessage: 'Close dialog'
  },
  applybuttontext: {
    id: 'addlayer.applybuttontext',
    description: 'Text of the apply button',
    defaultMessage: 'Apply'
  },
  applybuttontitle: {
    id: 'addlayer.applybuttontitle',
    description: 'Title of the apply button',
    defaultMessage: 'Upload local vector layer'
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
  static propTypes = {
    /**
     * The ol3 map instance to add to.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the button.
     */
    className: React.PropTypes.string,
    /**
     * The stroke width in pixels used in the style for the uploaded data.
     */
    strokeWidth: React.PropTypes.number,
    /**
     * The point radius used for the circle style.
     */
    pointRadius: React.PropTypes.number,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    strokeWidth: 2,
    pointRadius: 7
  };

  constructor(props, context) {
    super(props);
    this._formats = {
      'geojson': new ol.format.GeoJSON(),
      'json': new ol.format.GeoJSON(),
      'kml': new ol.format.KML({extractStyles: false}),
      'gpx': new ol.format.GPX()
    };
    this._counter = 0;
    this.state = {
      fillColor: '#452135',
      strokeColor: '#000',
      open: false,
      error: false,
      errorOpen: false,
      fileName: null,
      showProgress: false,
      muiTheme: context.muiTheme || getMuiTheme()
    };
  }
  _showDialog() {
    this.setState({open: true});
  }
  _closeDialog() {
    this.setState({fileName: null, showProgress: false, open: false});
  }
  _readFile(text) {
    this._text = text;
  }
  _generateId() {
    return ID_PREFIX + this._counter;
  }
  _readVectorFile() {
    this.setState({
      showProgress: true
    });
    var me = this;
    global.setTimeout(function() {
      var text = me._text;
      var filename = me.state.fileName;
      if (text && filename) {
        var ext = filename.split('.').pop().toLowerCase();
        var format = me._formats[ext];
        var map = me.props.map;
        if (format) {
          try {
            var crs = format.readProjection(text);
            if (crs === undefined) {
              me.setState({showProgress: false, error: true, fileName: null, errorOpen: true, msg: 'Unsupported projection'});
              return;
            }
            var features = format.readFeatures(text, {dataProjection: crs,
              featureProjection: map.getView().getProjection()});
            if (features && features.length > 0) {
              var fill = new ol.style.Fill({color: util.transformColor(me.state.fillColor)});
              var stroke = new ol.style.Stroke({color: util.transformColor(me.state.strokeColor), width: me.props.strokeWidth});
              var style = new ol.style.Style({
                ill: fill,
                stroke: stroke,
                image: new ol.style.Circle({stroke: stroke, fill: fill, radius: me.props.pointRadius})
              });
              me._counter++;
              var lyr = new ol.layer.Vector({
                id: me._generateId(),
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
              me._closeDialog();
            }
          } catch (e) {
            if (global && global.console) {
              me.setState({showProgress: false, error: true, fileName: null, errorOpen: true, msg: e.message});
            }
          }
        }
      }
    }, 0);
  }
  _onDrop(files) {
    if (files.length === 1) {
      var r = new FileReader(), file = files[0];
      var me = this;
      this.setState({fileName: file.name});
      r.onload = function(e) {
        me._readFile(e.target.result);
      };
      r.readAsText(file);
    }
  }
  _onChangeStroke(color) {
    this.setState({strokeColor: color.rgb});
  }
  _onChangeFill(color) {
    this.setState({fillColor: color.rgb});
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      dialog: {
        color: rawTheme.palette.textColor
      }
    };
  }
  render() {
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        autoHideDuration={5000}
        style={{transitionProperty : 'none'}}
        bodyStyle={{lineHeight: '24px', height: 'auto'}}
        open={this.state.errorOpen}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var body;
    if (this.state.showProgress) {
      body =  (<p className='add-layer-wait-msg'>{formatMessage(messages.waitmsg)}</p>);
    } else {
      body = (
        <GridList cols={3} cellHeight={350}>
          <GridTile>
            <label>{formatMessage(messages.dropzonelabel)}</label>
            <Dropzone className='dropzone' multiple={false} onDrop={this._onDrop.bind(this)}>
              <div className='add-layer-filename'>{this.state.fileName}</div>
              <div className='add-layer-dropzonehelp'>{formatMessage(messages.dropzonehelp)}</div>
            </Dropzone>
          </GridTile>
          <GridTile>
            <label>{formatMessage(messages.strokecolorlabel)}</label>
            <ColorPicker onChangeComplete={this._onChangeStroke.bind(this)} color={this.state.strokeColor} />
          </GridTile>
          <GridTile>
            <label>{formatMessage(messages.fillcolorlabel)}</label>
            <ColorPicker onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fillColor} />
          </GridTile>
        </GridList>
      );
    }
    var actions = [
      (<Button buttonType='Flat' tooltip={formatMessage(messages.applybuttontitle)} disabled={this.state.showProgress || this.state.fileName === null} label={formatMessage(messages.applybuttontext)} onTouchTap={this._readVectorFile.bind(this)} />),
      (<Button buttonType='Flat' disabled={this.state.showProgress} label={formatMessage(messages.closebuttontext)} tooltip={formatMessage(messages.closebuttontitle)} onTouchTap={this._closeDialog.bind(this)} />)
    ];
    return (
      <Button {...this.props} className={classNames('sdk-component add-layer', this.props.className)} icon={<UploadIcon />} tooltip={formatMessage(messages.menutitle)} label={formatMessage(messages.menutext)} onTouchTap={this._showDialog.bind(this)}>
        <Dialog style={styles.dialog} autoScrollBodyContent={true} actions={actions} open={this.state.open} onRequestClose={this._closeDialog.bind(this)} modal={true} title={formatMessage(messages.modaltitle)}>
          {error}
          {body}
        </Dialog>
      </Button>
    );
  }
}

export default injectIntl(AddLayer);
