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

class BaseMapConfigService {
  createSource(config) {
    if (config.standard === 'XYZ') {
      return new ol.source.XYZ({
        url: config.endpoint,
        attributions: config.attribution ? [
          new ol.Attribution({html: config.attribution})
        ] : undefined
      });
    } else if (config.standard === 'OSM') {
      return new ol.source.OSM();
    }
  }
  createLayer(config) {
    return new ol.layer.Tile({
      type: 'base',
      title: config.description,
      source: this.createSource(config)
    });
  }
}

export default new BaseMapConfigService();
