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

class RESTService {
  _getStyleNameUrl(url, layer, opt_proxy) {
    var id = layer.get('name').split(':').pop();
    return util.getProxiedUrl(url.replace(/wms|ows|wfs/g, 'rest/layers/' + id + '.json'), opt_proxy);
  }
  _parseStyleName(jsonData) {
    var styleName = jsonData.layer.defaultStyle.name;
    if (styleName.indexOf(':') === -1) {
      // look for workspace in JSON output
      if (jsonData.layer.defaultStyle.workspace) {
        styleName = jsonData.layer.defaultStyle.workspace + ':' + jsonData.layer.defaultStyle.name;
      }
    }
    return styleName;
  }
  getStyleName(url, layer, onSuccess, onFailure, opt_proxy) {
    url = this._getStyleNameUrl(url, layer, opt_proxy);
    util.doGET(url, function(xmlhttp) {
      var styleName = this._parseStyleName(JSON.parse(xmlhttp.responseText));
      onSuccess.call(this, styleName);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
  _createStylePayload(styleName) {
    return  '<style><name>' + styleName + '</name><filename>' + styleName + '.sld</filename></style>';
  }
  createStyle(url, layer, sld, onSuccess, onFailure, opt_proxy) {
    var styleName = 'web_sdk_style_' + Math.floor(100000 + Math.random() * 900000);
    var createUrl = url.replace(/wms|ows|wfs/g, 'rest/styles');
    util.doPOST(util.getProxiedUrl(createUrl, opt_proxy), this._createStylePayload(styleName), function(xmlhttp) {
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
  _getUpdateStyleUrl(url, layer, opt_proxy) {
    var styleName = layer.get('styleName');
    if (styleName.indexOf(':') !== -1) {
      var styleInfo = styleName.split(':');
      var workspace = styleInfo[0];
      var name = styleInfo[1];
      // workspaces styles
      return util.getProxiedUrl(url.replace(/wms|ows|wfs/g, 'rest/workspaces/' + workspace + '/styles/' + name), opt_proxy);
    } else {
      return util.getProxiedUrl(url.replace(/wms|ows|wfs/g, 'rest/styles/' + layer.get('styleName')), opt_proxy);
    }
  }
  updateStyle(url, layer, sld, onSuccess, onFailure, opt_proxy) {
    util.doPOST(this._getUpdateStyleUrl(url, layer, opt_proxy), sld, function(xmlhttp) {
      onSuccess.call(this, xmlhttp);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this, 'application/vnd.ogc.sld+xml; charset=UTF-8', true);
  }
}

export default new RESTService();
