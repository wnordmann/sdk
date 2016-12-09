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
import LayerIdService from './LayerIdService';
import WFSService from './WFSService';

class MapConfigService {
  generateSourceFromConfig(config) {
    var props = config.properties || {};
    if (props.attributions) {
      var attributions = [];
      for (var i = 0, ii = props.attributions.length; i < ii; ++i) {
        attributions.push(new ol.Attribution({
          html: props.attributions[i]
        }));
      }
      props.attributions = attributions;
    }
    props.wrapX = false;
    if (config.type === 'Cluster') {
      props.source = this.generateSourceFromConfig(config.source);
    }
    if (config.type === 'Vector') {
      props.format = (props.format.type === 'GeoJSON') ? new ol.format.GeoJSON() : undefined;
    }
    if (config.type === 'TMS') {
      config.type = 'XYZ';
      var urls = props.urls || [props.url];
      props.tileUrlFunction = function(tileCoord, pixelRatio, projection) {
        var min = 0;
        var max = urls.length - 1;
        var idx = Math.floor(Math.random() * (max - min + 1)) + min;
        var x, y, z;
        z = tileCoord[0];
        x = tileCoord[1];
        y = tileCoord[2] + (1 << z);
        return urls[idx] + z + '/' + x + '/' + y + '.' + props.format;
      };
      delete props.urls;
      delete props.url;
      var source = new ol.source[config.type](props);
      source.set('originalType', 'TMS');
      source.set('originalProperties', Object.assign({}, props, {
        urls: urls
      }));
      return source;
    }
    return new ol.source[config.type](props);
  }
  generateLayerFromConfig(config) {
    var type = config.type;
    var layerConfig = config.properties || {};
    if (layerConfig.id === undefined) {
      layerConfig.id = LayerIdService.generateId();
    }
    if (type === 'Group') {
      layerConfig.layers = [];
      for (var i = 0, ii = config.children.length; i < ii; ++i) {
        layerConfig.layers.push(this.generateLayerFromConfig(config.children[i]));
      }
    }
    var layer = new ol.layer[type](layerConfig);
    var sourceConfig = config.source;
    if (sourceConfig) {
      var source = this.generateSourceFromConfig(sourceConfig);
      if (source instanceof ol.source.TileWMS && !layer.get('wfsInfo')) {
        WFSService.describeFeatureType(sourceConfig.properties.urls[0], layerConfig.name, function(wfsInfo) {
          this.set('wfsInfo', wfsInfo);
        }, function() {
          this.set('isSelectable', false);
          this.set('wfsInfo', undefined);
        }, layer);
      }
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
    var attributions;
    var attr = source.getAttributions();
    if (attr !== null) {
      attributions = [];
      for (var i = 0, ii = attr.length; i < ii; ++i) {
        attributions.push(attr[i].getHTML());
      }
    }
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
      config.type = 'Vector';
      config.properties = {
        attributions: attributions,
        format: {
          type: this.getFormatType(source.getFormat())
        },
        url: source.getUrl()
      };
    } else if (source instanceof ol.source.ImageWMS) {
      config.type = 'ImageWMS';
      config.properties = {
        url: source.getUrl(),
        params: source.getParams(),
        attributions: attributions
      };
    } else if (source instanceof ol.source.OSM) {
      config.type = 'OSM';
      config.properties = {
        attributions: attributions
      };
    } else if (source instanceof ol.source.BingMaps) {
      config.type = 'BingMaps';
      config.properties = {
        key: source.getApiKey(),
        imagerySet: source.getImagerySet()
      };
    } else if (source instanceof ol.source.XYZ) {
      if (source.get('originalType') === 'TMS') {
        config.type = 'TMS';
        config.properties = source.get('originalProperties');
      } else {
        config.type = 'XYZ';
        config.properties = {
          attributions: attributions,
          urls: source.getUrls()
        };
      }
    } else if (source instanceof ol.source.TileArcGISRest) {
      config.type = 'TileArcGISRest';
      config.properties = {
        urls: source.getUrls(),
        params: source.getParams()
      };
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
    var remove = [];
    map.getLayers().forEach(function(lyr) {
      if (lyr.get('title') !== null) {
        remove.push(lyr);
      }
    });
    var i, ii;
    for (i = 0, ii = remove.length; i < ii; ++i) {
      map.removeLayer(remove[i]);
    }
    for (i = 0, ii = layerConfig.length; i < ii; ++i) {
      var layer = this.generateLayerFromConfig(layerConfig[i]);
      map.addLayer(layer);
    }
    var view = map.getView();
    view.setCenter(viewConfig.center);
    if (viewConfig.resolution !== undefined) {
      view.setResolution(viewConfig.resolution);
    } else if (viewConfig.zoom !== undefined) {
      view.setZoom(viewConfig.zoom);
    }
    if (viewConfig.rotation !== undefined) {
      view.setRotation(viewConfig.rotation);
    }
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
      projection: view.getProjection().getCode(),
      center: view.getCenter(),
      resolution: view.getResolution(),
      zoom: view.getZoom(),
      rotation: view.getRotation()
    };
    return config;
  }
}

export default new MapConfigService();
