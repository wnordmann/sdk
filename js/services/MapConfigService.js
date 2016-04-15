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

import ol from 'openlayers';

class MapConfigService {
  generateLayerFromConfig(config) {
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
  getLayerType(layer) {
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
  getFormatType(format) {
    if (format instanceof ol.format.GeoJSON) {
      return 'GeoJSON';
    }
  }
  getSourceConfig(source) {
    var config = {};
    if (source instanceof ol.source.TileWMS) {
      config.type = 'TileWMS';
      config.properties = {
        params: source.getParams(),
        urls: source.getUrls()
      };
    } else if (source instanceof ol.source.Cluster) {
      config.type = 'Cluster';
      config.source = this.getSourceConfig(source.getSource());
    } else if (source instanceof ol.source.Vector) {
      config.format = this.getFormatType(source.getFormat());
      config.url = source.getUrl();
      config.type = 'Vector';
    } else if (source instanceof ol.source.ImageWMS) {
      config.type = 'ImageWMS';
      config.properties = {
        url: source.getUrl(),
        params: source.getParams()
      };
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
  getLayerConfig(config, layer) {
    config.type = this.getLayerType(layer);
    config.properties = layer.getProperties();
    delete config.properties.maxResolution;
    delete config.properties.minResolution;
    var source = (config.type !== 'Group') ? layer.getSource() : null;
    if (source) {
      delete config.properties.source;
      config.source = this.getSourceConfig(source);
    }
    if (layer instanceof ol.layer.Group) {
      delete config.properties.layers;
      config.children = [];
      layer.getLayers().forEach(function(child) {
        if (child.get('title') !== null) {
          var childConfig = {};
          config.children.push(childConfig);
          this.getLayerConfig(childConfig, child);
        }
      }, this);
    }
    return config;
  }
  load(mapConfig, map) {
    var viewConfig = mapConfig.view;
    var layerConfig = mapConfig.layers;
    map.getLayers().clear();
    for (var i = 0, ii = layerConfig.length; i < ii; ++i) {
      var layer = this.generateLayerFromConfig(layerConfig[i]);
      map.addLayer(layer);
    }
    var view = map.getView();
    view.setCenter(viewConfig.center);
    view.setResolution(viewConfig.resolution);
    view.setRotation(viewConfig.rotation);
  }
  save(map) {
    var layers = [];
    map.getLayers().forEach(function(layer) {
      if (layer.get('title') !== null) {
        var config = {};
        layers.push(config);
        this.getLayerConfig(config, layer);
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
    return config;
  }
}

export default new MapConfigService();
