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

import util from '../util';
import ol from 'openlayers';
import URL from 'url-parse';

const format = new ol.format.EsriJSON();

class ArcGISRestService {
  createLayer(layer, url, titleObj, projection, opt_proxy) {
    var units = projection.getUnits();
    return new ol.layer.Tile({
      title: titleObj.title,
      emptyTitle: titleObj.empty,
      id: layer.Name,
      maxResolution: layer.MinScale !== 0 ? util.getResolutionForScale(layer.MinScale, units) : undefined,
      minResolution: layer.MaxScale !== 0 ? util.getResolutionForScale(layer.MaxScale, units) : undefined,
      name: layer.Name,
      isRemovable: true,
      wfsInfo: layer.Queryable,
      popupInfo: layer.Queryable ? '#AllAttributes' : undefined,
      source: new ol.source.TileArcGISRest({
        urls: [util.getProxiedUrl(url, opt_proxy)],
        params: {
          LAYERS: layer.Name
        }
      })
    });
  }
  parseCapabilities(jsonData) {
    var layers = [];
    // TODO parse layer hierarchy
    for (var i = 0, ii = jsonData.layers.length; i < ii; ++i) {
      var layer = {};
      var esriLayer = jsonData.layers[i];
      layer.MinScale = esriLayer.minScale;
      layer.MaxScale = esriLayer.maxScale;
      layer.Name = String(esriLayer.id);
      layer.Queryable = jsonData.capabilities && jsonData.capabilities.indexOf('Query') !== -1;
      layer.Title = esriLayer.name;
      layers.push(layer);
    }
    return {
      Layer: layers,
      Title: jsonData.serviceDescription
    };
  }
  getCapabilitiesUrl(url) {
    var urlObj = new URL(url);
    urlObj.set('query', {
      f: 'json',
      pretty: 'false',
      callback: '__cbname__'
    });
    return urlObj.toString();
  }
  getCapabilities(url, onSuccess, onFailure, opt_proxy) {
    // because it's JSONP we don't need to take into account opt_proxy
    util.doJSONP(this.getCapabilitiesUrl(url), function(jsonData) {
      onSuccess.call(this, this.parseCapabilities(jsonData));
    }, onFailure, this);
  }
  getLegendUrl(url) {
    var urlObj = new URL(url + '/legend');
    urlObj.set('query', {
      f: 'json',
      pretty: 'false',
      callback: '__cbname__'
    });
    return urlObj.toString();
  }
  getLegend(url, onSuccess) {
    util.doJSONP(this.getLegendUrl(url), function(jsonData) {
      onSuccess.call(this, jsonData);
    }, undefined, this);
  }
  getFeatureInfoUrl(layer, coordinate, map) {
    var view = map.getView();
    var urlObj = new URL(layer.getSource().getUrls()[0] + '/identify');
    urlObj.set('query', {
      geometryType: 'esriGeometryPoint',
      geometry: coordinate.join(','),
      sr: view.getProjection().getCode().split(':')[1],
      layers: layer.get('name'),
      tolerance: 2,
      mapExtent: view.calculateExtent(map.getSize()).join(','),
      imageDisplay: map.getSize().join(',') + ',90',
      f: 'json',
      callback: '__cbname__',
      pretty: 'false'
    });
    return urlObj.toString();
  }
  parseGetFeatureInfo(layer, jsonData) {
    var response = {layer: layer, features: []};
    for (var i = 0, ii = jsonData.results.length; i < ii; ++i) {
      var feature = format.readFeature(jsonData.results[i]);
      if (feature) {
        response.features.push(feature);
      }
    }
    return response;
  }
  getFeatureInfo(layer, coordinate, map, infoFormat, onSuccess, onFailure) {
    var url = this.getFeatureInfoUrl(layer, coordinate, map);
    var me = this;
    util.doJSONP(url, function(jsonData) {
      onSuccess.call(me, me.parseGetFeatureInfo(layer, jsonData));
    });
  }
  getLoadFeaturesUrl(layer, startIndex, pageSize, sortingInfo, srsName) {
    var urlObj = new URL(layer.getSource().getUrls()[0] + '/' + layer.get('name') + '/query');
    var params = {
      where: 'OBJECTID >= ' + startIndex + ' AND OBJECTID < ' + (startIndex + pageSize),
      f: 'json',
      callback: '__cbname__',
      pretty: 'false',
      outSR: srsName.split(':')[1]
    };
    if (sortingInfo.length === 1) {
      params.orderByFields = sortingInfo[0].id + ' ' + (sortingInfo[0].asc ? 'ASC' : 'DESC');
    }
    urlObj.set('query', params);
    return urlObj.toString();
  }
  loadFeatures(layer, startIndex, pageSize, sortingInfo, srsName, success, failure) {
    util.doJSONP(this.getLoadFeaturesUrl(layer, startIndex, pageSize, sortingInfo, srsName), function(jsonData) {
      if (jsonData.error) {
        failure.call(this, {status: jsonData.error.code, statusText: jsonData.error.message}, jsonData.error.details.join(' '));
      } else {
        success.call(this, format.readFeatures(jsonData));
      }
    }, failure, this);
  }
  getNumberOfFeaturesUrl(layer) {
    var urlObj = new URL(layer.getSource().getUrls()[0] + '/' + layer.get('name') + '/query');
    var params = {
      where: '1=1',
      f: 'json',
      callback: '__cbname__',
      pretty: 'false',
      returnCountOnly: true
    };
    urlObj.set('query', params);
    return urlObj.toString();
  }
  getNumberOfFeatures(layer, callback) {
    if (layer.get('numberOfFeatures') === undefined) {
      util.doJSONP(this.getNumberOfFeaturesUrl(layer), function(jsonData) {
        callback.call(this, jsonData.count);
      }, undefined, this);
    }
  }
}

export default new ArcGISRestService();
