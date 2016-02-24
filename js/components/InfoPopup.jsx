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
  }
});

const ALL_ATTRS = '#AllAttributes';

/**
 * Popup to show feature info. This can be through WMS GetFeatureInfo or local vector data.
 */
class InfoPopup extends BasePopup {
  constructor(props) {
    super(props);
    if (this.props.hover === true) {
      this.props.map.on('pointermove', this._onMapClick, this);
    } else {
      this.props.map.on('singleclick', this._onMapClick, this);
    }
    this._format = new ol.format.GeoJSON();
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
    } else if (layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo') && layer.get('popupInfo') !== '') {
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
    var geojsonFormat = this._format, xmlhttp, method, url, view = map.getView();
    var resolution = view.getResolution(), projection = view.getProjection();
    var onReadyAll = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        if (xmlhttp.responseText.trim() !== 'no features were found') {
          popupTexts.push(xmlhttp.responseText);
        }
        finishedQuery();
      }
    };
    const {formatMessage} = this.props.intl;
    var popupDef;
    var onReady = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        var features = geojsonFormat.readFeatures(xmlhttp.responseText);
        if (features.length) {
          var popupContent;
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
          popupTexts.push(popupContent);
        } else {
          popupTexts.push(formatMessage(messages.nofeatures));
        }
        finishedQuery();
      }
    };
    var called = false;
    for (var i = 0; i < len; i++) {
      var layer = allLayers[i];
      popupDef = layer.get('popupInfo');
      if (popupDef === ALL_ATTRS) {
        called = true;
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': 'text/plain'
          }
        );
        xmlhttp = new XMLHttpRequest();
        method = 'GET';
        xmlhttp.open(method, url, true);
        xmlhttp.onreadystatechange = onReadyAll;
        xmlhttp.send();
      } else if (popupDef) {
        called = true;
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': 'application/json'
          }
        );
        xmlhttp = new XMLHttpRequest();
        method = 'GET';
        xmlhttp.open(method, url, true);
        xmlhttp.onreadystatechange = onReady;
        xmlhttp.send();
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

InfoPopup.defaultProps = {
  hover: false
};

export default injectIntl(InfoPopup);
