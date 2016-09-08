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

import {doGET, doPOST} from '../util.js';

class RESTService {
  getStyleName(url, layer, onSuccess, onFailure) {
    var id = layer.get('id').split(':').pop();
    url = url.replace(/wms|ows|wfs/g, 'rest/layers/' + id + '.json');
    doGET(url, function(xmlhttp) {
      var styleInfo = JSON.parse(xmlhttp.responseText);
      var styleName = styleInfo.layer.defaultStyle.name;
      if (styleName.indexOf(':') === -1) {
        // look for workspace in JSON output
        if (styleInfo.layer.defaultStyle.workspace) {
          styleName = styleInfo.layer.defaultStyle.workspace + ':' + styleInfo.layer.defaultStyle.name;
        }
      }
      onSuccess.call(this, styleName);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
  createStyle(url, layer, sld, onSuccess, onFailure) {
    var styleName = 'web_sdk_style_' + Math.floor(100000 + Math.random() * 900000);
    var createUrl = url.replace(/wms|ows|wfs/g, 'rest/styles');
    doPOST(createUrl, '<style><name>' + styleName + '</name><filename>' + styleName + '.sld</filename></style>', function(xmlhttp) {
      layer.set('styleName', styleName);
      this.updateStyle(url, layer, sld, onSuccess, onFailure);
    }, function(xmlhttp) {
      if (xmlhttp.responseText.indexOf('already exists') !== -1) {
        // retry under a new name
        this.createStyle(url, layer, sld, onSuccess, onFailure);
      } else {
        onFailure.call(this, xmlhttp);
      }
    }, this);
  }
  updateStyle(url, layer, sld, onSuccess, onFailure) {
    var styleName = layer.get('styleName');
    if (styleName.indexOf(':') !== -1) {
      var styleInfo = styleName.split(':');
      var workspace = styleInfo[0];
      var name = styleInfo[1];
      // workspaces styles
      url = url.replace(/wms|ows|wfs/g, 'rest/workspaces/' + workspace + '/styles/' + name);
    } else {
      url = url.replace(/wms|ows|wfs/g, 'rest/styles/' + layer.get('styleName'));
    }
    doPOST(url, sld, function(xmlhttp) {
      onSuccess.call(this, xmlhttp);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this, 'application/vnd.ogc.sld+xml; charset=UTF-8', true);
  }
}

export default new RESTService();
