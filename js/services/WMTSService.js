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

import URL from 'url-parse';
import {doGET} from '../util.js';
import ol from 'openlayers';

const wmtsGetFeatureInfoFormats = {
  'application/json': new ol.format.GeoJSON(),
  'application/vnd.ogc.gml': new ol.format.WFS()
};

class WMTSService {
  getFeatureInfo(layer, coordinate, view, infoFormat, onSuccess) {
    var resolution = view.getResolution();
    var source = layer.getSource();
    var tilegrid = source.getTileGrid();
    var tileResolutions = tilegrid.getResolutions();
    var zoomIdx, diff = Infinity;
    for (var i = 0; i < tileResolutions.length; i++) {
      var tileResolution = tileResolutions[i];
      var diffP = Math.abs(resolution - tileResolution);
      if (diffP < diff) {
        diff = diffP;
        zoomIdx = i;
      }
      if (tileResolution < resolution) {
        break;
      }
    }
    var tileSize = tilegrid.getTileSize(zoomIdx);
    var tileOrigin = tilegrid.getOrigin(zoomIdx);
    var fx = (coordinate[0] - tileOrigin[0]) / (resolution * tileSize);
    var fy = (tileOrigin[1] - coordinate[1]) / (resolution * tileSize);
    var tileCol = Math.floor(fx);
    var tileRow = Math.floor(fy);
    var tileI = Math.floor((fx - tileCol) * tileSize);
    var tileJ = Math.floor((fy - tileRow) * tileSize);
    var matrixIds = tilegrid.getMatrixIds()[zoomIdx];
    var matrixSet = source.getMatrixSet();
    var url = source.getUrls()[0];
    var urlObj = new URL(url);
    urlObj.set('query', {
      service: 'WMTS',
      request: 'GetFeatureInfo',
      version: source.getVersion(),
      layer: source.getLayer(),
      infoformat: infoFormat,
      style: source.getStyle(),
      format: source.getFormat(),
      tilecol: tileCol,
      tilerow: tileRow,
      tilematrix: matrixIds,
      tilematrixset: matrixSet,
      i: tileI,
      j: tileJ
    });
    doGET(urlObj.toString(), function(response) {
      var result = {};
      if (infoFormat === 'text/plain' || infoFormat === 'text/html') {
        if (response.responseText.trim() !== 'no features were found') {
          result.text = response.responseText;
        } else {
          result = false;
        }
      } else {
        result.features = wmtsGetFeatureInfoFormats[infoFormat].readFeatures(response.responseText);
      }
      result.layer = layer;
      onSuccess.call(this, result);
    });
  }
}

export default new WMTSService();
