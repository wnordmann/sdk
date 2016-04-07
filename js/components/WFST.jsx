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
import Pui from 'pui-react-alerts';
import UI from 'pui-react-buttons';
import pureRender from 'pure-render-decorator';
import url from 'url';
import {doGET, doPOST} from '../util.js';
import EditForm from './EditForm.jsx';
import './WFST.css';

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
  modifyfeature: {
    id: 'wfst.modifyfeature',
    description: 'Button text for modify / select existing feature',
    defaultMessage: 'Modify / Select'
  },
  deletefeature: {
    id: 'wfst.deletefeature',
    description: 'Button text for delete selected feature',
    defaultMessage: 'Delete'
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

const wfsFormat = new ol.format.WFS();
const xmlSerializer = new XMLSerializer();

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
      error: false,
      visible: this.props.visible
    };
    this._interactions = {};
    this._select = new ol.interaction.Select();
    var features = this._select.getFeatures();
    this._modify = new ol.interaction.Modify({
      features: features
    });
    features.on('add', this._onSelectAdd, this);
    features.on('remove', this._onSelectRemove, this);
    this._selectfeature = new SelectFeature(this._selectWMS, this);
    this._dirty = {};
  }
  componentWillUnmount() {
    this.deactivate();
  }
  _onLayerSelectChange(layer) {
    this._setLayer(layer);
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
    this.setState({layer: layer});
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
        var point = ol.proj.toLonLat(coord);
        var wfsInfo = me.state.layer.get('wfsInfo');
        var urlObj = url.parse(wfsInfo.url);
        urlObj.query  = {
          service: 'WFS',
          request: 'GetFeature',
          version : '1.1.0',
          srsName: me.props.map.getView().getProjection().getCode(),
          typename: wfsInfo.featureType,
          cql_filter: 'DWITHIN(' + wfsInfo.geometryName + ', Point(' + point[1] + ' ' + point[0] + '), 0.1, meters)'
        };
        doGET(url.format(urlObj), function(xmlhttp) {
          var features = wfsFormat.readFeatures(xmlhttp.responseXML);
          for (var i = 0, ii = features.length; i < ii; ++i) {
            me._select.getFeatures().push(features[i]);
            me.setState({feature: features[i]});
          }
        }, function(xmlhttp) {}, me);
      }
      return !found;
    } else {
      return true;
    }
  }
  _modifyFeature() {
    this.deactivate();
    var layer = this.state.layer;
    var interactions = [this._select, this._modify];
    if (!(layer.getSource() instanceof ol.source.Vector)) {
      interactions.push(this._selectfeature);
    }
    this.activate(interactions);
  }
  _deleteFeature() {
    var wfsInfo = this.state.layer.get('wfsInfo');
    const {formatMessage} = this.props.intl;
    var features = this._select.getFeatures();
    if (features.getLength() === 1) {
      var feature = features.item(0);
      var node = wfsFormat.writeTransaction(null, null, [feature], {
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      doPOST(this.state.layer.get('wfsInfo').url, xmlSerializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalDeleted === 1) {
            this._select.getFeatures().clear();
            var source = this.state.layer.getSource();
            if (source instanceof ol.source.Vector) {
              source.removeFeature(feature);
            } else {
              this._redraw();
            }
          } else {
            this._setError(formatMessage(messages.deletemsg));
          }
        },
        function(xmlhttp) {
          this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
        },
        this
      );
    }
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _filterLayerList(lyr) {
    return lyr.get('isWFST');
  }
  _onSelectAdd(evt) {
    var feature = evt.element;
    feature.on('change', function(evt) {
      this._dirty[evt.target.getId()] = true;
    }, this);
  }
  _onSelectRemove(evt) {
    var feature = evt.element;
    var wfsInfo = this.state.layer.get('wfsInfo');
    var fid = feature.getId();
    if (this._dirty[fid]) {
      var featureGeometryName = feature.getGeometryName();
      // do a WFS transaction to update the geometry
      var properties = feature.getProperties();
      // get rid of boundedBy which is not a real property
      // get rid of bbox (in the case of GeoJSON)
      delete properties.boundedBy;
      delete properties.bbox;
      if (wfsInfo.geometryName !== featureGeometryName) {
        properties[wfsInfo.geometryName] = properties[featureGeometryName];
        delete properties[featureGeometryName];
      }
      var clone = new ol.Feature(properties);
      clone.setId(fid);
      if (wfsInfo.geometryName !== featureGeometryName) {
        clone.setGeometryName(wfsInfo.geometryName);
      }
      var node = wfsFormat.writeTransaction(null, [clone], null, {
        gmlOptions: {
          srsName: this.props.map.getView().getProjection().getCode()
        },
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      doPOST(this.state.layer.get('wfsInfo').url, xmlSerializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalUpdated === 1) {
            delete this._dirty[fid];
          }
          if (!(this.state.layer.getSource() instanceof ol.source.Vector)) {
            this._redraw();
          }
        },
        function(xmlhttp) {
          this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
        },
        this
      );
    }
  }
  _readResponse(data) {
    var result;
    if (global.Document && data instanceof global.Document && data.documentElement &&
      data.documentElement.localName == 'ExceptionReport') {
      this._setError(data.getElementsByTagNameNS('http://www.opengis.net/ows', 'ExceptionText').item(0).textContent);
    } else {
      result = wfsFormat.readTransactionResponse(data);
    }
    return result;
  }
  _onDrawEnd(evt) {
    var wfsInfo = this.state.layer.get('wfsInfo');
    var feature = evt.feature;
    var node = wfsFormat.writeTransaction([feature], null, null, {
      gmlOptions: {
        srsName: this.props.map.getView().getProjection().getCode()
      },
      featureNS: wfsInfo.featureNS,
      featureType: wfsInfo.featureType
    });
    doPOST(this.state.layer.get('wfsInfo').url, xmlSerializer.serializeToString(node),
      function(xmlhttp) {
        var data = xmlhttp.responseText;
        var result = this._readResponse(data);
        if (result) {
          var insertId = result.insertIds[0];
          if (insertId == 'new0') {
            // reload data if we're dealing with a shapefile store
            var source = this.state.layer.getSource();
            if (source instanceof ol.source.Vector) {
              source.clear();
            } else {
              this._redraw();
            }
          } else {
            feature.setId(insertId);
          }
        }
      },
      function(xmlhttp) {
        this.deactivate();
        this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
      },
      this
    );
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
  render() {
    if (!this.state.visible) {
      return (<article />);
    } else {
      const {formatMessage} = this.props.intl;
      var error;
      if (this.state.error === true) {
        error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
      }
      var layerSelector;
      if (this.props.layerSelector) {
        layerSelector = (
          <article>
            <label htmlFor='layerSelector'>{formatMessage(messages.layerlabel)}</label>
            <LayerSelector onChange={this._onLayerSelectChange.bind(this)} id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} />
          </article>
        );
      } else if (this.state.layer) {
        var label = formatMessage(messages.layerlabel) + ': ' + this.state.layer.get('title');
        layerSelector = (<div>{label}</div>);
      }
      var editForm;
      if (this.props.showEditForm && this.state.feature) {
        editForm = (<EditForm feature={this.state.feature} layer={this.state.layer} />);
      }
      return (
        <form onSubmit={this._onSubmit} role='form'>
          {layerSelector}
          <UI.DefaultButton onClick={this._drawFeature.bind(this)}>{formatMessage(messages.drawfeature)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._modifyFeature.bind(this)}>{formatMessage(messages.modifyfeature)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._deleteFeature.bind(this)}>{formatMessage(messages.deletefeature)}</UI.DefaultButton>
          {editForm}
          {error}
        </form>
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

WFST.defaultProps = {
  showEditForm: false,
  layerSelector: true,
  visible: true,
  pointBuffer: 0.5
};

export default injectIntl(WFST);
