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
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LayerConstants from '../constants/LayerConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerSelector from './LayerSelector.jsx';
import FeatureStore from '../stores/FeatureStore.js';
import MapTool from './MapTool.js';
import RaisedButton from './Button.jsx';
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete';
import DrawIcon from 'material-ui/lib/svg-icons/image/brush';
import EditIcon from 'material-ui/lib/svg-icons/editor/mode-edit';
import Snackbar from 'material-ui/lib/snackbar';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import pureRender from 'pure-render-decorator';
import EditForm from './EditForm.jsx';
import WFSService from '../services/WFSService.js';

var SelectFeature = function(handleEvent, scope) {
  this._scope = scope;
  ol.interaction.Interaction.call(this, {
    handleEvent: handleEvent
  });
};
ol.inherits(SelectFeature, ol.interaction.Interaction);

const messages = defineMessages({
  layerlabel: {
    id: 'wfst.layerlabel',
    description: 'Label for the layer combo box',
    defaultMessage: 'Layer'
  },
  drawfeature: {
    id: 'wfst.drawfeature',
    description: 'Button text for draw new feature',
    defaultMessage: 'Draw'
  },
  drawfeaturetitle: {
    id: 'wfst.drawfeaturetitle',
    description: 'Button help text for draw new feature',
    defaultMessage: 'Draw a new feature on the map'
  },
  modifyfeature: {
    id: 'wfst.modifyfeature',
    description: 'Button text for modify / select existing feature',
    defaultMessage: 'Modify / Select'
  },
  modifyfeaturetitle: {
    id: 'wfst.modifyfeaturetitle',
    description: 'Button title for modify / select existing feature',
    defaultMessage: 'Modify an existing feature or select before Delete'
  },
  deletefeature: {
    id: 'wfst.deletefeature',
    description: 'Button text for delete selected feature',
    defaultMessage: 'Delete'
  },
  deletefeaturetitle: {
    id: 'wfst.deletefeaturetitle',
    description: 'Button title for delete selected feature',
    defaultMessage: 'Delete the selected feature'
  },
  errormsg: {
    id: 'wfst.errormsg',
    description: 'Error message to show the user when a request fails',
    defaultMessage: 'Error saving this feature to GeoServer. {msg}'
  },
  deletemsg: {
    id: 'wfst.deletemsg',
    description: 'Error message to show when delete fails',
    defaultMessage: 'There was an issue deleting the feature.'
  }
});

/**
 * Allows users to make changes to WFS-T layers. This can be drawing new
 * features and deleting or modifying existing features. Only geometry
 * changes are currently supported, no attribute changes.
 * This depends on ol.layer.Vector with ol.source.Vector. The layer
 * needs to have isWFST set to true. Also a wfsInfo object needs to be
 * configured on the layer with the following properties:
 * - featureNS: the namespace of the WFS typename
 * - featureType: the name (without prefix) of the underlying WFS typename
 * - geometryType: the type of geometry (e.g. MultiPolygon)
 * - geometryName: the name of the geometry attribute
 * - url: the online resource of the WFS endpoint
 *
 * ```xml
 * <WFST map={map} />
 * ```
 */
@pureRender
class WFST extends MapTool {
  constructor(props) {
    super(props);
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LayerConstants.EDIT_LAYER:
          me._toggleLayer(action.layer);
          break;
        default:
          break;
      }
    });
    this.state = {
      modifySecondary: false,
      drawSecondary: false,
      disabled: false,
      error: false,
      open: false,
      visible: this.props.visible
    };
    this._interactions = {};
    this._select = new ol.interaction.Select();
    var features = this._select.getFeatures();
    this._modify = new ol.interaction.Modify({
      features: features,
      wrapX: false
    });
    features.on('add', this._onSelectAdd, this);
    features.on('remove', this._onSelectRemove, this);
    this._selectfeature = new SelectFeature(this._selectWMS, this);
    this._dirty = {};
  }
  componentWillUnmount() {
    if (this._request) {
      this._request.abort();
    }
    this.deactivate();
  }
  activate(interactions) {
    super.activate.call(this, interactions);
    var hasSelect = false;
    for (var i = 0, ii = interactions.length; i < ii; ++i) {
      if (interactions[i] instanceof ol.interaction.Select) {
        hasSelect = true;
        break;
      }
    }
    if (hasSelect) {
      this.setState({modifySecondary: true, drawSecondary: false});
    } else {
      this.setState({modifySecondary: false, drawSecondary: true});
    }
  }
  deactivate() {
    super.deactivate();
    this._select.getFeatures().clear();
    this.setState({feature: null, modifySecondary: false, drawSecondary: false});
  }
  _onLayerSelectChange(layer) {
    this._select.getFeatures().clear();
    if (layer !== null) {
      this._setLayer(layer);
    } else {
      this.setState({feature: null, layer: null});
    }
  }
  _toggleLayer(layer) {
    if (layer === this.state.layer) {
      // toggle visibility
      var newVis = !this.state.visible;
      this.setState({visible: newVis});
      if (newVis === false) {
        this.deactivate();
      }
    } else {
      this.setState({visible: true, layer: layer});
    }
  }
  _setError(msg) {
    this.setState({
      error: true,
      open: true,
      msg: msg
    });
  }
  _setLayer(layer) {
    var source = layer.getSource();
    if (source instanceof ol.source.Vector && source.getFeatures().length > 0) {
      this.props.map.getView().fit(
        source.getExtent(),
        this.props.map.getSize()
      );
    }
    this.setState({feature: null, layer: layer});
  }
  _selectWMS(evt) {
    if (evt.type === 'singleclick') {
      var me = this._scope;
      var coord = evt.coordinate;
      var buffer = me.props.pointBuffer;
      var extent = [coord[0] - buffer, coord[1] - buffer, coord[0] + buffer, coord[1] + buffer];
      var state = FeatureStore.getState(me.state.layer);
      var found = false;
      me._select.getFeatures().clear();
      if (state) {
        var features = state.originalFeatures;
        for (var i = 0, ii = features.length; i < ii; ++i) {
          var geom = features[i].getGeometry();
          if (geom.intersectsExtent(extent)) {
            found = true;
            me.setState({feature: features[i]});
            me._select.getFeatures().push(features[i]);
          }
        }
      }
      if (found === false) {
        this._request = WFSService.distanceWithin(me.state.layer, me.props.map.getView(), coord, function(feature) {
          me._select.getFeatures().push(feature);
          me.setState({feature: feature});
          delete me._request;
        }, function() {
          delete me._request;
        });
      }
      return !found;
    } else {
      return true;
    }
  }
  _modifyFeature() {
    this.deactivate();
    var layer = this.state.layer;
    if (layer) {
      var interactions = [this._select, this._modify];
      if (!(layer.getSource() instanceof ol.source.Vector)) {
        interactions.push(this._selectfeature);
      }
      this.activate(interactions);
    }
  }
  _deleteFeature() {
    const {formatMessage} = this.props.intl;
    var me = this;
    var features = this._select.getFeatures();
    if (features.getLength() === 1) {
      var feature = features.item(0);
      this._request = WFSService.deleteFeature(this.state.layer, feature, function() {
        delete me._request;
        me._select.getFeatures().clear();
        var source = me.state.layer.getSource();
        if (source instanceof ol.source.Vector) {
          source.removeFeature(feature);
        } else {
          FeatureStore.removeFeature(me.state.layer, feature);
          me._redraw();
        }
        me.setState({feature: null});
      }, function(xmlhttp, msg) {
        delete me._request;
        msg = msg || formatMessage(messages.deletemsg) + xmlhttp.status + ' ' + xmlhttp.statusText;
        me._setError(msg);
      });
    }
  }
  _filterLayerList(lyr) {
    return lyr.get('isWFST') && lyr.get('wfsInfo') !== undefined;
  }
  _onSelectAdd(evt) {
    var feature = evt.element;
    feature.on('change', function(evt) {
      this._dirty[evt.target.getId()] = true;
    }, this);
  }
  _onSelectRemove(evt) {
    var feature = evt.element;
    var fid = feature.getId();
    if (this._dirty[fid]) {
      var me = this;
      this._request = WFSService.updateFeature(this.state.layer, this.props.map.getView(), feature, null, function(result) {
        delete me._request;
        if (result && result.transactionSummary.totalUpdated === 1) {
          delete me._dirty[fid];
        }
        if (!(me.state.layer.getSource() instanceof ol.source.Vector)) {
          me._redraw();
        }
      }, function(xmlhttp, msg) {
        delete me._request;
        me._setError(msg || (xmlhttp.status + ' ' + xmlhttp.statusText));
      });
    }
  }
  _onDrawEnd(evt) {
    var me = this;
    this._request = WFSService.insertFeature(this.state.layer, this.props.map.getView(), evt.feature, function(insertId) {
      delete me._request;
      if (insertId == 'new0') {
        // reload data if we're dealing with a shapefile store
        var source = me.state.layer.getSource();
        if (source instanceof ol.source.Vector) {
          source.clear();
        } else {
          me._redraw();
        }
      } else {
        evt.feature.setId(insertId);
        FeatureStore.addFeature(this.state.layer, evt.feature);
      }
    }, function(xmlhttp, msg) {
      delete me._request;
      me.deactivate();
      me._setError(msg || (xmlhttp.status + ' ' + xmlhttp.statusText));
    });
  }
  _redraw() {
    this.state.layer.getSource().updateParams({'_olSalt': Math.random()});
  }
  _drawFeature() {
    var layer = this.state.layer;
    var layerId = layer.get('id');
    var wfsInfo = layer.get('wfsInfo');
    var source;
    if (layer.getSource() instanceof ol.source.Vector) {
      source = layer.getSource();
    }
    if (!this._interactions[layerId]) {
      this._interactions[layerId] = {
        draw:  new ol.interaction.Draw({
          source: source,
          type: wfsInfo.geometryType,
          geometryName: wfsInfo.geometryName
        })
      };
      this._interactions[layerId].draw.on('drawend', this._onDrawEnd, this);
    }
    var draw = this._interactions[layerId].draw;
    this.deactivate();
    this.activate([draw]);
  }
  _handleRequestClose() {
    this.setState({
      open: false
    });
  }
  disable() {
    this.setState({disabled: true});
  }
  enable() {
    this.setState({disabled: false});
  }
  render() {
    if (!this.state.visible) {
      return (<article />);
    } else {
      const {formatMessage} = this.props.intl;
      var error;
      if (this.state.error === true) {
        error = (<Snackbar
          bodyStyle={{backgroundColor: 'rgba(255, 0, 0, 0.8)'}}
          open={this.state.open}
          message={formatMessage(messages.errormsg, {msg: this.state.msg})}
          autoHideDuration={2000}
          onRequestClose={this._handleRequestClose.bind(this)}
        />);
      }
      var layerSelector;
      if (this.props.layerSelector) {
        layerSelector = (
          <LayerSelector style={{marginLeft: '36px'}} {...this.props} onChange={this._onLayerSelectChange.bind(this)} id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} />
        );
      } else if (this.state.layer) {
        var label = formatMessage(messages.layerlabel) + ': ' + this.state.layer.get('title');
        layerSelector = (<div>{label}</div>);
      }
      var editForm;
      if (this.props.showEditForm && this.state.feature) {
        editForm = (<EditForm feature={this.state.feature} layer={this.state.layer} />);
      }
      const buttonStyle = this.props.buttonStyle;
      return (
        <div className='sdk-component wfst'>
          {layerSelector}
          <Toolbar>
            <ToolbarGroup>
              <RaisedButton secondary={this.state.drawSecondary} tooltipStyle={{left: 0}} tooltip={formatMessage(messages.drawfeaturetitle)} style={buttonStyle} label={formatMessage(messages.drawfeature)} disabled={this.state.disabled || !this.state.layer} onTouchTap={this._drawFeature.bind(this)} icon={<DrawIcon />} />
            </ToolbarGroup>
            <ToolbarGroup>
              <RaisedButton secondary={this.state.modifySecondary} tooltipStyle={{left: 0}} tooltip={formatMessage(messages.modifyfeaturetitle)} style={buttonStyle} label={formatMessage(messages.modifyfeature)} disabled={this.state.disabled || !this.state.layer} onTouchTap={this._modifyFeature.bind(this)} icon={<EditIcon />} />
            </ToolbarGroup>
            <ToolbarGroup>
              <RaisedButton tooltipStyle={{left: 0}} tooltip={formatMessage(messages.deletefeaturetitle)} style={buttonStyle} label={formatMessage(messages.deletefeature)} disabled={this.state.disabled || !this.state.layer} onTouchTap={this._deleteFeature.bind(this)} icon={<DeleteIcon />} />
            </ToolbarGroup>
          </Toolbar>
          {error}
          {editForm}
        </div>
      );
    }
  }
}

WFST.propTypes = {
  /**
   * The ol3 map whose layers can be used for the WFS-T tool.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Show a layer selector for the user to choose from?
   */
  layerSelector: React.PropTypes.bool,
  /**
   * Should this component be visible from the start?
   */
  visible: React.PropTypes.bool,
  /**
   * Buffer to put around clicked point to find the feature clicked. This is in the units of the coordinate reference system of the map.
   */
  pointBuffer: React.PropTypes.number,
  /**
   * Should we display an edit form for editing feature attributes on select?
   */
  showEditForm: React.PropTypes.bool,
  /**
   * Style for the buttons in the toolbar.
   */
  buttonStyle: React.PropTypes.object,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

WFST.defaultProps = {
  buttonStyle: {
    margin: '10px 12px'
  },
  showEditForm: false,
  layerSelector: true,
  visible: true,
  pointBuffer: 0.5
};

export default injectIntl(WFST);
