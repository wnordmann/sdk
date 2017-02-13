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

import {addLayer, removeLayer} from './layers/actions';
import RESTService from '../services/RESTService';
import WFSService from '../services/WFSService';

const getLayerInfo = (layer) => {
  // TODO proxy, request headers
  if (!(layer instanceof ol.layer.Group)) {
    var source = layer.getSource();
    if ((source instanceof ol.source.ImageWMS || source instanceof ol.source.TileWMS) || layer.get('isWFST')) {
      if (!layer.get('wfsInfo')) {
        var url = source.getUrls()[0];
        WFSService.describeFeatureType(url, layer.get('name'), function(wfsInfo) {
          layer.set('wfsInfo', wfsInfo);
        }, function() {
          layer.set('isSelectable', false);
          layer.set('wfsInfo', undefined);
        });
      }
      if (!layer.get('styleName')) {
        RESTService.getStyleName(layer, function(styleName) {
          layer.set('styleName', styleName);
        }, function() {
        });
      }
    }
  }
};

const addLayerAndGetInfo = (layer) => {
  getLayerInfo(layer);
  return addLayer(layer);
};

export default function(store, map) {
  map.getLayers().forEach(function(layer) {
    store.dispatch(addLayerAndGetInfo(layer));
  });
  map.getLayers().on('add', function(evt) {
    store.dispatch(addLayerAndGetInfo(evt.element));
  });
  map.getLayers().on('remove', function(evt) {
    store.dispatch(removeLayer(map, evt.element));
  });
}
