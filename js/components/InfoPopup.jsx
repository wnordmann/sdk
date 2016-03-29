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
import BasePopup from './BasePopup.jsx';
import ol from 'openlayers';
import {doGET} from '../util.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  nofeatures: {
    id: 'infopopup.nofeatures',
    description: 'Text to show if no features were found',
    defaultMessage: 'No features at this location'
  },
  nulltext: {
    id: 'infopopup.nulltext',
    description: 'Text to show if attribute has no value',
    defaultMessage: 'NULL'
  },
  nametext: {
    id: 'infopopup.nametext',
    description: 'Text to show for the name column',
    defaultMessage: 'Name'
  },
  valuetext: {
    id: 'infopopup.valuetext',
    description: 'Text to show for the value column',
    defaultMessage: 'Value'
  }
});

const ALL_ATTRS = '#AllAttributes';

/**
 * Popup to show feature info. This can be through WMS GetFeatureInfo or local vector data.
 *
 * ```html
 * <div id='popup' className='ol-popup'>
 *   <InfoPopup toggleGroup='navigation' map={map} />
 * </div>
 * ```
 */
class InfoPopup extends BasePopup {
  constructor(props) {
    super(props);
    if (this.props.hover === true) {
      this.props.map.on('pointermove', this._onMapClick, this);
    } else {
      this.props.map.on('singleclick', this._onMapClick, this);
    }
    this._formats = {};
    this._formats['application/json'] = new ol.format.GeoJSON();
    this._formats['application/vnd.ogc.gml'] = new ol.format.WMSGetFeatureInfo();
    this.active = true;
    this.state = {
      popupTexts: []
    };
  }
  _forEachLayer(layers, layer) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function(groupLayer) {
        this._forEachLayer(layers, groupLayer);
      }, this);
    } else if (layer instanceof ol.layer.Tile && layer.getVisible() && layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo') && layer.get('popupInfo') !== '') {
      layers.push(layer);
    }
  }
  _fetchData(evt, popupTexts, cb) {
    var map = this.props.map;
    var allLayers = [];
    this._forEachLayer(allLayers, map.getLayerGroup());
    var len = allLayers.length;
    var finishedQueries = 0;
    var finishedQuery = function() {
      finishedQueries++;
      if (len === finishedQueries) {
        cb();
      }
    };
    var url, view = map.getView();
    var resolution = view.getResolution(), projection = view.getProjection();
    var onReadyAll = function(response) {
      if (response.responseText.trim() !== 'no features were found') {
        popupTexts.push(response.responseText);
      }
      finishedQuery();
    };
    const {formatMessage} = this.props.intl;
    var popupDef;
    var createSimpleTable = function(features) {
      var result = '';
      for (var i = 0, ii = features.length; i < ii; ++i) {
        var feature = features[i];
        result += '<span class="infopopup-header">' + feature.getId() + '</span>';
        result += '<table class="infopopup-table" border="1"><tr><th>' + formatMessage(messages.nametext) + '</th><th>' + formatMessage(messages.valuetext) + '</th></tr>';
        var keys = feature.getKeys();
        var geom = feature.getGeometryName();
        for (var j = 0, jj = keys.length; j < jj; ++j) {
          var key = keys[j];
          if (key !== geom && key !== 'boundedBy') {
            result += '<tr><td>' + key + '</td><td>' + feature.get(key) + '</td></tr>';
          }
        }
        result += '</table>';
      }
      return result;
    };
    var onReady = function(response) {
      var features = this.readFeatures(response.responseText);
      if (features.length) {
        var popupContent;
        if (popupDef === ALL_ATTRS) {
          popupContent = createSimpleTable(features);
        } else {
          for (var j = 0, jj = features.length; j < jj; ++j) {
            popupContent = popupDef;
            var feature = features[j];
            var values = feature.getProperties();
            for (var key in values) {
              var value = values[key];
              if (value) {
                popupContent = popupContent.replace('[' + key + ']', value);
              } else {
                popupContent = popupContent.replace('[' + key + ']', formatMessage(messages.nulltext));
              }
            }
          }
        }
        popupTexts.push(popupContent);
      } else {
        popupTexts.push(formatMessage(messages.nofeatures));
      }
      finishedQuery();
    };
    var called = false;
    for (var i = 0; i < len; i++) {
      var layer = allLayers[i];
      popupDef = layer.get('popupInfo');
      if (popupDef === ALL_ATTRS) {
        called = true;
        var infoFormat = this.props.infoFormat;
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': infoFormat
          }
        );
        if (infoFormat === 'text/plain' || infoFormat === 'text/html') {
          doGET(url, onReadyAll);
        } else {
          doGET(url, onReady, null, this._formats[infoFormat]);
        }
      } else if (popupDef) {
        called = true;
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': 'application/json'
          }
        );
        doGET(url, onReady, null, this._formats['application/json']);
      }
    }
    if (called === false) {
      cb();
    }
  }
  _onMapClick(evt) {
    if (this.active) {
      const {formatMessage} = this.props.intl;
      var map = this.props.map;
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var popupTexts = [];
      var me = this;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          var popupDef = layer.get('popupInfo');
          if (popupDef) {
            var featureKeys = feature.getKeys();
            for (var i = 0, ii = featureKeys.length; i < ii; i++) {
              var value = feature.get(featureKeys[i]);
              if (value) {
                popupDef = popupDef.replace('[' + featureKeys[i] + ']', feature.get(featureKeys[i]));
              } else {
                popupDef = popupDef.replace('[' + featureKeys[i] + ']', formatMessage(messages.nulltext));
              }
            }
            popupTexts.push(popupDef);
          }
        }
      });
      this._fetchData(evt, popupTexts, function() {
        if (popupTexts.length) {
          me.overlayPopup.setPosition(coord);
          if (popupTexts.length) {
            me.setState({
              popupTexts: popupTexts
            });
          }
          me.setVisible(true);
        } else {
          me.setVisible(false);
        }
      });
    }
  }
  render() {
    var content = this.state.popupTexts.join('<hr>');
    return (
      <article>
        <a href="#" ref="popupCloser" className="popup-closer fa fa-times fa-pull-right"></a>
        <div className='popup-content' ref='content' dangerouslySetInnerHTML={{__html: content}}></div>
      </article>
    );
  }
}

InfoPopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Should we show feature info on hover instead of on click?
   */
  hover: React.PropTypes.bool,
  /**
   * Format to use for WMS GetFeatureInfo requests.
   */
  infoFormat: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

InfoPopup.defaultProps = {
  hover: false,
  infoFormat: 'text/plain'
};

export default injectIntl(InfoPopup);
