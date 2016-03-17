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
import UI from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  menubuttontext: {
    id: 'mapconfig.menubuttontext',
      description: 'Title for the Map Config menu',
      defaultMessage: 'Map'
  },
  savetext: {
    id: 'mapconfig.savetext',
    description: 'Text for the Save menu option',
    defaultMessage: 'Save'
  },
  loadtext: {
    id: 'mapconfig.loadtext',
    description: 'Text for the Load menu option',
    defaultMessage: 'Load'
  }
});

const localStorageKey = 'web-sdk-map-config';

/**
 * Export the map configuration and ability to reload it from local storage.
 */
@pureRender
class MapConfig extends React.Component {
  constructor(props) {
    super(props);
  }
  _generateLayerFromConfig(config) {
    var type = config.type;
    var layerConfig = config.properties || {};
    layerConfig.id = 'sdk-layer-' + Math.random();
    if (type === 'Group') {
      layerConfig.layers = [];
      for (var i = 0, ii = config.children.length; i < ii; ++i) {
        layerConfig.layers.push(this._generateLayerFromConfig(config.children[i]));
      }
    }
    var layer = new ol.layer[type](layerConfig);
    var sourceConfig = config.source;
    if (sourceConfig) {
      var props = sourceConfig.properties || {};
      if (sourceConfig.type === 'Cluster') {
        props.source = new ol.source[sourceConfig.source.type](sourceConfig.source.properties || {});
      }
      if (sourceConfig.type === 'Vector') {
        props.url = sourceConfig.url;
        props.format = (sourceConfig.format === 'GeoJSON') ? new ol.format.GeoJSON() : undefined;
      }
      var source = new ol.source[sourceConfig.type](props);
      layer.setSource(source);
    }
    return layer;
  }
  _load() {
    var config = global.localStorage.getItem(localStorageKey);
    var mapConfig = JSON.parse(config);
    var viewConfig = mapConfig.view;
    var layerConfig = mapConfig.layers;
    var map = this.props.map;
    map.getLayers().clear();
    for (var i = 0, ii = layerConfig.length; i < ii; ++i) {
      var layer = this._generateLayerFromConfig(layerConfig[i]);
      map.addLayer(layer);
    }
    var view = map.getView();
    view.setCenter(viewConfig.center);
    view.setResolution(viewConfig.resolution);
    view.setRotation(viewConfig.rotation);
  }
  _save() {
    var map = this.props.map;
    var layers = [];
    var root = map.getLayerGroup();
    map.getLayers().forEach(function(layer) {
      if (layer.get('title') !== null) {
        var config = {};
        layers.push(config);
        this._getLayerConfig(config, layer);
      }
    }, this);
    var config = {};
    config.layers = layers;
    var view = map.getView();
    config.view = {
      center: view.getCenter(),
      resolution: view.getResolution(),
      rotation: view.getRotation()
    };
    var output = JSON.stringify(config);
    global.localStorage.setItem(localStorageKey, output);
  }
  _getLayerType(layer) {
    if (layer instanceof ol.layer.Group) {
      return 'Group';
    } else if (layer instanceof ol.layer.Vector) {
      return 'Vector';
    } else if (layer instanceof ol.layer.Tile) {
      return 'Tile';
    } else if (layer instanceof ol.layer.Image) {
      return 'Image';
    }
  }
  _getFormatType(format) {
    if (format instanceof ol.format.GeoJSON) {
      return 'GeoJSON';
    }
  }
  _getSourceConfig(source) {
    var config = {};
    if (source instanceof ol.source.TileWMS) {
      config.type = 'TileWMS';
    } else if (source instanceof ol.source.Cluster) {
      config.type = 'Cluster';
      config.source = this._getSourceConfig(source.getSource());
    } else if (source instanceof ol.source.Vector) {
      config.format = this._getFormatType(source.getFormat());
      config.url = source.getUrl();
      config.type = 'Vector';
    } else if (source instanceof ol.source.ImageWMS) {
      config.type = 'ImageWMS';
    } else if (source instanceof ol.source.MapQuest) {
      config.properties = {
        layer:  source.getLayer()
      };
      config.type = 'MapQuest';
    } else if (source instanceof ol.source.XYZ) {
      config.type = 'XYZ';
    }
    return config;
  }
  _getLayerConfig(config, layer) {
    config.type = this._getLayerType(layer);
    config.properties = layer.getProperties();
    delete config.properties.maxResolution;
    delete config.properties.minResolution;
    var source = (config.type !== 'Group') ? layer.getSource(): null;
    if (source) {
      delete config.properties.source;
      config.source = this._getSourceConfig(source);
    }
    if (layer instanceof ol.layer.Group) {
      delete config.properties.layers;
      config.children = [];
      var childConfig = {};
      layer.getLayers().forEach(function(child) {
        if (child.get('title') !== null) {
          var childConfig = {};
          config.children.push(childConfig);
          this._getLayerConfig(childConfig, child);
        }
      }, this);
    }
    return config;
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.Dropdown {...this.props} title={formatMessage(messages.menubuttontext)}>
        <UI.DropdownItem onSelect={this._load.bind(this)}>{formatMessage(messages.loadtext)}</UI.DropdownItem>
        <UI.DropdownItem onSelect={this._save.bind(this)}>{formatMessage(messages.savetext)}</UI.DropdownItem>
      </UI.Dropdown>
    );
  }
}

MapConfig.propTypes = {
  /**
   * The ol3 map to save the layers from.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(MapConfig);
