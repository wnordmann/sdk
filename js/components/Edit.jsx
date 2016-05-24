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

/* eslint react/prop-types: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/lib/dialog';
import Snackbar from 'material-ui/lib/snackbar';
import TextField from 'material-ui/lib/text-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import SelectField from 'material-ui/lib/select-field';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import RaisedButton from 'material-ui/lib/raised-button';
import ol from 'openlayers';
import MapTool from './MapTool.js';
import {transformColor} from '../util.js';
import ColorPicker from 'react-color';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './Edit.css';

const NEW_ATTR_PREFIX = 'new-attr-';
const ID_PREFIX = 'sdk-edit-';

const messages = defineMessages({
  nolayer: {
    id: 'edit.nolayer',
    description: 'Text to show in the combo box when no layer has been created',
    defaultMessage: 'None'
  },
  enable: {
    id: 'edit.enable',
    description: 'Button text to enable edit mode',
    defaultMessage: 'Enable edit mode'
  },
  newlayer:{
    id: 'edit.newlayer',
    description: 'Button text to create a new layer',
    defaultMessage: 'New layer'
  },
  disable: {
    id: 'edit.disable',
    description: 'Button text to disable edit mode',
    defaultMessage: 'Disable edit mode'
  },
  nolayererror: {
    id: 'edit.nolayererror',
    description: 'Error text for when no layer is available',
    defaultMessage: 'No editable layer is available. Create one to start editing.'
  },
  layerlabel: {
    id: 'edit.layerlabel',
    description: 'Label to show in front of layer combo box',
    defaultMessage: 'Layer'
  },
  newfeaturemodaltitle: {
    id: 'edit.newfeaturemodaltitle',
    description: 'Title for the modal dialog to specify attributes for a new feature',
    defaultMessage: 'New feature attributes'
  },
  okbuttontitle: {
    id: 'edit.okbuttontitle',
    description: 'Title text for Ok button in attributes modal',
    defaultMessage: 'Set feature attributes'
  },
  okbuttontext: {
    id: 'edit.okbuttontext',
    description: 'Text for Ok button in attributes modal',
    defaultMessage: 'Ok'
  },
  createlayermodaltitle: {
    id: 'edit.createlayermodaltitle',
    description: 'Title for the modal dialog to create a new layer',
    defaultMessage: 'Create empty layer'
  },
  layernamelabel: {
    id: 'edit.layernamelabel',
    description: 'Label for the layer name input field in the create layer modal',
    defaultMessage: 'Layer name'
  },
  geometrytypelabel: {
    id: 'edit.geometrytypelabel',
    description: 'Label for the geometry type combo in the create layer modal',
    defaultMessage: 'Geometry type'
  },
  pointgeomtype: {
    id: 'edit.pointgeomtype',
    description: 'Title for point geometry option in combo box',
    defaultMessage: 'Point'
  },
  linegeomtype: {
    id: 'edit.linegeomtype',
    description: 'Title for line geometry option in combo box',
    defaultMessage: 'LineString'
  },
  polygeomtype: {
    id: 'edit.polygeomtype',
    description: 'Title for polygon geometry option in combo box',
    defaultMessage: 'Polygon'
  },
  attributeslabel: {
    id: 'edit.attributeslabel',
    description: 'Label for attributes input field in new layer dialog',
    defaultMessage: 'Attributes (comma-separated names)'
  },
  strokecolorlabel: {
    id: 'edit.strokecolorlabel',
    description: 'Label for stroke color field in new layer dialog',
    defaultMessage: 'Stroke color'
  },
  fillcolorlabel: {
    id: 'edit.fillcolorlabel',
    description: 'Label for fill color field in new layer dialog',
    defaultMessage: 'Fill color'
  },
  createbuttontitle: {
    id: 'edit.createbuttontitle',
    description: 'Title for create button in new layer dialog',
    defaultMessage: 'Create empty layer'
  },
  createbuttontext: {
    id: 'edit.createbuttontext',
    description: 'Text for create button in new layer dialog',
    defaultMessage: 'Create'
  },
  closebuttontext: {
    id: 'edit.closebuttontext',
    description: 'Text for close button',
    defaultMessage: 'Close'
  }
});

/**
 * A component that allows creating new features, so drawing their geometries and setting feature attributes through a form.
 *
 * ```xml
 * <div ref='editToolPanel' className='edit-tool-panel'><Edit toggleGroup='navigation' map={map} /></div>
 * ```
 */
@pureRender
class Edit extends MapTool {
  constructor(props) {
    super(props);
    this._interactions = {};
    this.state = {
      layers: [],
      enable: true,
      error: false,
      errorOpen: false,
      attributes: null,
      attributeOpen: false,
      open: false
    };
    this._strokeColor = '#452135';
    this._fillColor = '#452135';
  }
  _onChangeStroke(color) {
    this._strokeColor = transformColor(color);
  }
  _onChangeFill(color) {
    this._fillColor = transformColor(color);
  }
  _generateId() {
    return ID_PREFIX + this.state.layers.length;
  }
  _createLayer() {
    var layerName = this.refs.layerName.getValue();
    var geometryType = this.state.geometryType;
    var attributes = this.refs.attributes.getValue();
    if (layerName !== '') {
      var fill = this._fillColor ? new ol.style.Fill({color: this._fillColor}) : undefined;
      var stroke = this._strokeColor ? new ol.style.Stroke({color: this._strokeColor, width: this.props.strokeWidth}) : undefined;
      var style = new ol.style.Style({
        fill: fill,
        stroke: stroke,
        image: (fill || stroke) ? new ol.style.Circle({stroke: stroke, fill: fill, radius: this.props.pointRadius}) : undefined
      });
      var layer = new ol.layer.Vector({
        title: layerName,
        id: this._generateId(),
        geomType: geometryType,
        schema: attributes,
        isSelectable: true,
        isRemovable: true,
        style: style,
        source: new ol.source.Vector({wrapX: false, useSpatialIndex: false})
      });
      this.props.map.addLayer(layer);
      var layers = this.state.layers.slice();
      layers.push(layer);
      this._layer = layer.get('id');
      this.setState({open: false, geometryType: null, layers: layers});
    }
  }
  _disableEditMode() {
    this.setState({enable: true});
    this.deactivate();
  }
  _findLayerById(layerId) {
    for (var i = 0, ii = this.state.layers.length; i < ii; ++i) {
      if (this.state.layers[i].get('id') === layerId) {
        return this.state.layers[i];
      }
    }
  }
  _onLayerChange(evt, idx, value) {
    this._layer = value;
    this.setState({layer: this._layer});
  }
  _enableEditMode() {
    if (this.state.layers.length === 0) {
      this.setState({error: true, errorOpen: true});
    } else {
      this.setState({error: false, errorOpen: false, enable: false});
      this._activate();
    }
  }
  _addFeatureDialog(feature, attributes) {
    this._feature = feature;
    this.setState({
      attributes: attributes,
      attributeOpen: true
    });
  }
  _setAttributes() {
    var feature = this._feature;
    for (var i = 0, ii = this.state.attributes.length; i < ii; ++i) {
      var name = this.state.attributes[i];
      var value = ReactDOM.findDOMNode(this.refs[NEW_ATTR_PREFIX + name]).value;
      feature.set(name, value);
    }
    this.setState({
      attributeOpen: false
    });
  }
  _activate() {
    var layerId = this._layer;
    var layer = this._findLayerById(layerId);
    var featColl = layer.getSource().getFeaturesCollection();
    if (!this._interactions[layerId]) {
      this._interactions[layerId] = {
        draw: new ol.interaction.Draw({
          features: featColl,
          type: layer.get('geomType')
        }),
        modify: new ol.interaction.Modify({
          features: featColl,
          deleteCondition: function(event) {
            return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
          }
        })
      };
      var schema = layer.get('schema').trim();
      if (schema.length > 0) {
        this._interactions[layerId].draw.on('drawend', function(evt) {
          this._addFeatureDialog(evt.feature, schema.split(','));
        }, this);
      }
    }
    var draw = this._interactions[layerId].draw;
    var modify = this._interactions[layerId].modify;
    this.deactivate();
    this.activate([draw, modify]);
  }
  _showModal() {
    this.setState({open: true});
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  _changeGeometryType(evt, idx, value) {
    this.setState({
      geometryType: value
    });
  }
  close() {
    this.setState({
      open: false
    });
  }
  closeAttributes() {
    this.setState({
      attributeOpen: false
    });
  }
  render() {
    const buttonStyle = this.props.buttonStyle;
    if (!this.state.enable) {
      this._activate();
    }
    const {formatMessage} = this.props.intl;
    var options = [], i, ii;
    for (i = 0, ii = this.state.layers.length; i < ii; ++i) {
      var lyr = this.state.layers[i], title = lyr.get('title'), id = lyr.get('id');
      options.push(<MenuItem key={id} value={id} primaryText={title} />);
    }
    var button;
    if (this.state.enable === true) {
      button = (<RaisedButton style={buttonStyle} label={formatMessage(messages.enable)} onTouchTap={this._enableEditMode.bind(this)} />);
    } else {
      button = (<RaisedButton style={buttonStyle} label={formatMessage(messages.disable)} onTouchTap={this._disableEditMode.bind(this)} />);
    }
    var attributeFormItems;
    if (this.state.attributes !== null) {
      attributeFormItems = [];
      for (i = 0, ii = this.state.attributes.length; i < ii; ++i) {
        var name = this.state.attributes[i], ref = NEW_ATTR_PREFIX + name;
        attributeFormItems.push(<TextField key={ref} floatingLabelText={name} ref={ref} />);
      }
    }
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        open={this.state.errorOpen}
        bodyStyle={{backgroundColor: 'rgba(255, 0, 0, 0.8)'}}
        message={formatMessage(messages.nolayererror)}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var attributeActions = [
      <RaisedButton label={formatMessage(messages.okbuttontext)} onTouchTap={this._setAttributes.bind(this)} />,
      <RaisedButton label={formatMessage(messages.closebuttontext)} onTouchTap={this.closeAttributes.bind(this)} />
    ];
    var actions = [
      <RaisedButton label={formatMessage(messages.createbuttontext)} onTouchTap={this._createLayer.bind(this)} />,
      <RaisedButton label={formatMessage(messages.closebuttontext)} onTouchTap={this.close.bind(this)} />
    ];
    return (
      <div className='sdk-component edit'>
        <SelectField hintText={formatMessage(messages.nolayer)} onChange={this._onLayerChange.bind(this)} floatingLabelText={formatMessage(messages.layerlabel)} value={this._layer} ref='layer'>
          {options}
        </SelectField>
        <Toolbar>
          <RaisedButton style={buttonStyle} label={formatMessage(messages.newlayer)} onTouchTap={this._showModal.bind(this)} />
          {button}
        </Toolbar>
        {error}
        <Dialog open={this.state.attributeOpen} actions={attributeActions} autoScrollBodyContent={true} onRequestClose={this.closeAttributes.bind(this)} modal={true} title={formatMessage(messages.newfeaturemodaltitle)}>
          {attributeFormItems}
        </Dialog>
        <Dialog actions={actions} onRequestClose={this.close.bind(this)} modal={true} autoScrollBodyContent={true} title={formatMessage(messages.createlayermodaltitle)} open={this.state.open}>
          <TextField floatingLabelText={formatMessage(messages.layernamelabel)} ref="layerName" /><br/>
          <SelectField value={this.state.geometryType} onChange={this._changeGeometryType.bind(this)} floatingLabelText={formatMessage(messages.geometrytypelabel)} ref='geometryType'>
            <MenuItem key='Point' value='Point' primaryText={formatMessage(messages.pointgeomtype)} />
            <MenuItem key='LineString' value='LineString' primaryText={formatMessage(messages.linegeomtype)} />
            <MenuItem key='Polygon' value='Polygon' primaryText={formatMessage(messages.polygeomtype)} />
          </SelectField><br/>
          <TextField floatingLabelText={formatMessage(messages.attributeslabel)} ref="attributes" /><br/>
          <label>{formatMessage(messages.strokecolorlabel)}</label>
          <ColorPicker type='compact' onChangeComplete={this._onChangeStroke.bind(this)} ref='strokeColor' color={this._strokeColor} />
          <label>{formatMessage(messages.fillcolorlabel)}</label>
          <ColorPicker type='compact' onChangeComplete={this._onChangeFill.bind(this)} ref='fillColor' color={this._fillColor} />
       </Dialog>
      </div>
    );
  }
}

Edit.propTypes = {
  /**
   * The map onto which to activate and deactivate the interactions.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The stroke width in pixels used in the style for the created features.
   */
  strokeWidth: React.PropTypes.number,
  /**
   * The point radius used for the circle style.
   */
  pointRadius: React.PropTypes.number,
  /**
   * Style for the buttons in the toolbar.
   */
  buttonStyle: React.PropTypes.object,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Edit.defaultProps = {
  buttonStyle: {
    margin: '10px 12px'
  },
  strokeWidth: 2,
  pointRadius: 7
};

export default injectIntl(Edit);
