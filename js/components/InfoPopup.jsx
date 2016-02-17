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
import MapTool from './MapTool.js';
import ol from 'openlayers';
import './InfoPopup.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {BasicInput} from 'pui-react-inputs';
import UI from 'pui-react-buttons';
import FeatureActions from '../actions/FeatureActions.js';

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
  save: {
    id: 'infopopup.save',
    description: 'Text to show on the save button',
    defaultMessage: 'Save'
  }
});

const ALL_ATTRS = '#AllAttributes';

class InfoPopup extends MapTool {
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
      popupTexts: [],
      values: {},
      dirty: {}
    };
  }
  componentDidMount() {
    this._overlayPopup = new ol.Overlay({
      element: ReactDOM.findDOMNode(this).parentNode
    });
    this.props.map.addOverlay(this._overlayPopup);
  }
  activate(interactions) {
    this.active = true;
    super.activate(interactions);
  }
  deactivate() {
    this.active = false;
    super.deactivate();
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
  _onChangeField(evt) {
    var dirty = this.state.dirty;
    var values = this.state.values;
    values[evt.target.id] = evt.target.value;
    dirty[evt.target.id] = true;
    this.setState({values: values, dirty: dirty});
  }
  _onMapClick(evt) {
    if (this.active) {
      const {formatMessage} = this.props.intl;
      var map = this.props.map;
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var popupTexts = [];
      var me = this;
      var cont = false;
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
          } else if (layer.get('isWFST')) {
            cont = true;
            me.setState({
              feature: feature,
              dirty: {},
              layer: layer,
              values: feature.getProperties()
            });
          }
          if (popupDef) {
            popupTexts.push(popupDef);
          }
        }
      });
      this._fetchData(evt, popupTexts, function() {
        if (cont === true || popupTexts.length) {
          me._overlayPopup.setPosition(coord);
          if (popupTexts.length) {
            me.setState({
              popupTexts: popupTexts
            });
          }
          me._setVisible(true);
        } else {
          me._setVisible(false);
        }
      });
    }
  }
  _setVisible(visible) {
    ReactDOM.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
    var me = this;
    // regular jsx onClick does not work when stopEvent is true
    var closer = ReactDOM.findDOMNode(this.refs.popupCloser);
    if (closer.onclick === null) {
      closer.onclick = function() {
        me._setVisible(false);
        return false;
      };
    }
    var saveButton = ReactDOM.findDOMNode(this.refs.saveButton);
    if (saveButton && saveButton.onclick === null) {
      saveButton.onclick = function() {
        me._save();
        return false;
      };
    }
  }
  _save() {
    if (this.state.dirty) {
      var values = {};
      for (var key in this.state.dirty) {
        values[key] = this.state.values[key];
        // TODO do this in the success handler
        this.state.feature.set(key, values[key]);
      }
      FeatureActions.modifyFeatureAttributes(this.state.layer, this.state.feature, values);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.state.feature) {
      var keys = this.state.feature.getKeys();
      var inputs = [];
      for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i];
        if (key !== this.state.feature.getGeometryName()) {
          inputs.push(<BasicInput label={key} key={key} id={key} onChange={this._onChangeField.bind(this)} value={this.state.values[key]} />);
        }
      }
      return (
        <article>
          <a href="#" ref="popupCloser" className="popup-closer fa fa-times fa-pull-right"></a>
          <div className='popup-content' ref='content'>
            {inputs}
            <UI.DefaultButton ref="saveButton">{formatMessage(messages.save)}</UI.DefaultButton>
          </div>
        </article>
      );
    } else {
      var content = this.state.popupTexts.join('<hr>');
      return (
        <article>
          <a href="#" ref="popupCloser" className="popup-closer fa fa-times fa-pull-right"></a>
          <div className='popup-content' ref='content' dangerouslySetInnerHTML={{__html: content}}></div>
        </article>
      );
    }
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
