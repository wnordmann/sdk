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
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import LayerSelector from './LayerSelector';
import LayerStore from '../stores/LayerStore';
import FeatureStore from '../stores/FeatureStore';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ToolUtil from '../toolutil';
import ToolConstants from '../constants/ToolConstants';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import Button from './Button';
import classNames from 'classnames';
import WFSService from '../services/WFSService';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Snackbar from 'material-ui/Snackbar';
import './BasePopup.css';

const messages = defineMessages({
  cancel: {
    id: 'editpopup.cancel',
    description: 'Text to show on the cancel button',
    defaultMessage: 'Cancel'
  },
  save: {
    id: 'editpopup.save',
    description: 'Text to show on the save button',
    defaultMessage: 'Add'
  },
  layer: {
    id: 'editpopup.layer',
    description: 'Label text for layer combo',
    defaultMessage: 'Assign to layer'
  },
  errormsg: {
    id: 'editpopup.errormsg',
    description: 'Error message to show the user when a request fails',
    defaultMessage: 'Error saving this feature to GeoServer. {msg}'
  },
  updatemsg: {
    id: 'editpopup.updatemsg',
    description: 'Text to show if the transaction fails',
    defaultMessage: 'Error updating the feature\'s attributes using WFS-T.'
  }
});

/**
 * Popup that can be used for feature editing (attribute form).
 *
 * ```xml
 * <EditPopup map={map} />
 * ```
 */
class EditPopup extends React.Component {
  static propTypes = {
    /**
     * The ol3 map to register for singleClick.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    proxy: React.PropTypes.string,
    requestHeaders: React.PropTypes.object,
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    this._dispatchToken = ToolUtil.register(this);
    this.state = {
      error: false,
      open: false,
      feature: null,
      layer: null,
      dirty: {},
      values: {}
    };
    this.props.map.on('singleclick', this._onMapClick, this);
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentDidMount() {
    this.overlayPopup = new ol.Overlay({
      autoPan: true,
      stopEvent: false,
      element: ReactDOM.findDOMNode(this).parentNode
    });
    this.props.map.addOverlay(this.overlayPopup);
    var me = this;
    this._dispatchToken2 = AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case ToolConstants.SHOW_EDIT_POPUP:
          me.setState({
            feature: action.feature,
            layer: action.layer,
            values: action.feature.getProperties()
          });
          me._callback = action.callback;
          me.setVisible(true);
          me.overlayPopup.setPosition(ol.extent.getTopRight(action.feature.getGeometry().getExtent()));
          break;
        default:
          break;
      }
    });
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
    AppDispatcher.unregister(this._dispatchToken2);
  }
  activate(interactions) {
    this.active = true;
    // it is intentional not to call activate on ToolUtil here
  }
  deactivate() {
    this.active = false;
    // it is intentional not to call deactivate on ToolUtil here
  }
  _getLayers() {
    var state = LayerStore.getState();
    var layers = [];
    for (var i = 0, ii = state.flatLayers.length; i < ii; ++i) {
      var layer = state.flatLayers[i];
      if (layer instanceof ol.layer.Tile && layer.getVisible() && (layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo'))) {
        layers.push(layer);
      }
    }
    return layers;
  }
  _onMapClick(evt) {
    if (this.active) {
      var map = this.props.map;
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var me = this;
      var found = false;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          if (layer !== null && layer.get('isWFST')) {
            found = true;
            me.setState({
              feature: feature,
              layer: layer
            }, function() {
              me.setVisible(true);
              me.overlayPopup.setPosition(coord);
            });
          }
        }
      });
      if (!found) {
        // try WFS queries
        var layers = this._getLayers();
        for (var i = 0, ii = layers.length; i < ii; ++i) {
          WFSService.distanceWithin(layers[i], map.getView(), coord, (function(feature) {
            me.setState({
              feature: feature,
              layer: this
            }, function() {
              me.setVisible(true);
              me.overlayPopup.setPosition(coord);
            });
          }).bind(layers[i]), undefined, this._proxy, this._requestHeaders);
        }
      }
    }
  }
  _doCallback() {
    if (this._callback) {
      this._callback(true);
      delete this._callback;
    }
  }
  _onCancel() {
    this.setVisible(false);
    this._doCallback();
  }
  _onSuccess() {
    this.setVisible(false);
  }
  setVisible(visible) {
    ReactDOM.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
  }
  _filterLayerList(lyr) {
    if (this.state.feature) {
      var geom = this.state.feature.getGeometry();
      var geomType;
      if (geom instanceof ol.geom.Polygon) {
        geomType = 'Polygon';
      } else if (geom instanceof ol.geom.LineString) {
        geomType = 'Line';
      } else if (geom instanceof ol.geom.Point) {
        geomType = 'Point';
      }
      var local = lyr.get('geometryType') && lyr.get('geometryType').indexOf(geomType) !== -1;
      var wfs = lyr.get('isWFST') && lyr.get('wfsInfo') !== undefined && lyr.get('wfsInfo').geometryType.indexOf(geomType) !== -1;
      return local || wfs;
    } else {
      return lyr.get('isWFST') && lyr.get('wfsInfo') !== undefined;
    }
  }
  _onLayerSelectChange(layer) {
    this.setState({layer: layer});
  }
  _redraw() {
    this.state.layer.getSource().updateParams({'_olSalt': Math.random()});
  }
  _setError(msg) {
    this.setState({
      open: true,
      error: true,
      msg: msg
    });
  }
  _onChangeGeom(evt) {
    this._geomDirty = true;
    evt.target.un('change', this._onChangeGeom, this);
  }
  save() {
    const {formatMessage} = this.props.intl;
    var id = this.state.feature.getId();
    var me = this, key;
    var onFailure = function(xmlhttp, msg) {
      me._setError(msg || (xmlhttp.status + ' ' + xmlhttp.statusText));
    };
    // INSERT
    if (id === undefined) {
      for (key in this.state.dirty) {
        this.state.feature.set(key, this.state.values[key]);
      }
      if (this.state.layer.get('wfsInfo')) {
        WFSService.insertFeature(this.state.layer, this.props.map.getView(), this.state.feature, function(insertId) {
          if (insertId == 'new0') {
            // reload data if we're dealing with a shapefile store
            var source = me.state.layer.getSource();
            if (source instanceof ol.source.Vector) {
              source.clear();
            } else {
              me._redraw();
            }
          } else {
            this.state.feature.setId(insertId);
            FeatureStore.addFeature(this.state.layer, this.state.feature);
          }
          me._doCallback();
          me.setVisible(false);
        }, onFailure);
      } else {
        this.state.layer.getSource().addFeature(this.state.feature);
        me._doCallback();
        me.setVisible(false);
      }
    } else { // UPDATE
      if (!this.state.layer.get('wfsInfo')) {
        for (key in this.state.dirty) {
          this.state.feature.set(key, this.state.values[key]);
        }
        me.setState({dirty: {}});
        me._doCallback();
        me.setVisible(false);
      } else {
        var values = {};
        for (key in this.state.dirty) {
          values[key] = this.state.values[key];
        }
        if (this._geomDirty) {
          var geomName = this.state.layer.get('wfsInfo') ? this.state.layer.get('wfsInfo').geometryName : this.state.feature.getGeometryName();
          values[geomName] = this.state.feature.getGeometry();
        }
        var onSuccess = function(result) {
          if (result && result.transactionSummary.totalUpdated === 1) {
            for (key in me.state.dirty) {
              me.state.feature.set(key, values[key]);
            }
            me.setState({dirty: {}});
            if (!(me.state.layer.getSource() instanceof ol.source.Vector)) {
              me._redraw();
            }
          } else {
            me._setError(formatMessage(messages.updatemsg));
          }
          me._doCallback();
          me.setVisible(false);
        };
        WFSService.updateFeature(this.state.layer, this.props.map.getView(), this.state.feature, values, onSuccess, onFailure);
      }
    }
  }
  _onChangeField(evt) {
    var dirty = this.state.dirty;
    var values = this.state.values;
    values[evt.target.id] = evt.target.value;
    dirty[evt.target.id] = true;
    this.setState({values: values, dirty: dirty});
  }
  _handleRequestClose() {
    this.setState({
      open: false
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        open={this.state.open}
        bodyStyle={{height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line'}}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        autoHideDuration={5000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var editForm;
    if (this.state.feature && this.state.layer) {
      this.state.feature.on('change', this._onChangeGeom, this);
      var inputs = [];
      var feature = this.state.feature, layer = this.state.layer;
      var fid = feature.getId();
      var keys = layer.get('wfsInfo') ? layer.get('wfsInfo').attributes : layer.get('attributes');
      for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i];
        var value = this.state.values[key] || '';
        inputs.push(<TextField floatingLabelFixed={true} floatingLabelText={key} key={key} id={key} onChange={this._onChangeField.bind(this)} value={value} />);
      }
      editForm = (
        <div className={classNames('sdk-component edit-form', this.props.className)}>
          <span className='edit-form-fid'>{fid}</span><br/>
          {inputs}
        </div>
      );
    }
    var id = this.state.layer ? this.state.layer.get('id') : undefined;
    var layerSelector = this.state.layer ? undefined : (
      <LayerSelector intl={this.props.intl} labelText={formatMessage(messages.layer)} value={id} onChange={this._onLayerSelectChange.bind(this)} filter={this._filterLayerList.bind(this)} map={this.props.map} />
    );
    var buttons = (<span style={{float: 'right'}}><Button buttonType='Flat' primary={true} onTouchTap={this._onCancel.bind(this)} label={formatMessage(messages.cancel)} /><Button disabled={!this.state.layer} buttonType='Flat' primary={true} onTouchTap={this.save.bind(this)} label={formatMessage(messages.save)} /></span>);
    return (
      <div style={this.props.style} className={classNames('sdk-component edit-popup', this.props.className)}>
        {error}
        <div className='popup-content' ref='content'>
          {layerSelector}
          {editForm}
        </div>
        {buttons}
      </div>
    );
  }
}

export default injectIntl(EditPopup);
