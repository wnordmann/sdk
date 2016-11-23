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

class ArcGISRestService {
  createLayer(layer, url, titleObj) {
    return new ol.layer.Tile({
      title: titleObj.title,
      emptyTitle: titleObj.empty,
      id: layer.Name,
      name: layer.Name,
      isRemovable: true,
      source: new ol.source.TileArcGISRest({
        urls: [url],
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
      layer.Name = esriLayer.id;
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
  getCapabilities(url, onSuccess) {
    util.doJSONP(this.getCapabilitiesUrl(url), function(jsonData) {
      onSuccess.call(this, this.parseCapabilities(jsonData));
    }, this);
  }
}

export default new ArcGISRestService();
