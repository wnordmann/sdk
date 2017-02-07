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
import URL from 'url-parse';
import ol from 'openlayers';

class RESTService {
  _getBaseUrl(layer) {
    var url;
    if (layer.get('wfsInfo')) {
      url = layer.get('wfsInfo').url;
    } else if (layer.getSource() instanceof ol.source.TileWMS) {
      url = layer.getSource().getUrls()[0];
    } else if (layer.getSource() instanceof ol.source.ImageWMS) {
      url = layer.getSource().getUrl();
    }
    var urlObj = new URL(url, true);
    urlObj.set('pathname', urlObj.pathname.replace(/wms|ows|wfs/, 'rest'));
    return urlObj;
  }
  _getTrailingChar(urlObj) {
    return urlObj.pathname.slice(-1) === '/' ? '' : '/';
  }
  _getStyleNameUrl(layer, opt_proxy) {
    var urlObj = this._getBaseUrl(layer);
    var id = layer.get('name').split(':').pop();
    urlObj.set('pathname', urlObj.pathname + this._getTrailingChar(urlObj) + 'layers/' + id + '.json');
    return util.getProxiedUrl(urlObj.toString(), opt_proxy);
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
  getStyleName(layer, onSuccess, onFailure, opt_proxy, opt_requestHeaders) {
    var url = this._getStyleNameUrl(layer, opt_proxy);
    util.doGET(url, function(xmlhttp) {
      var styleName = this._parseStyleName(JSON.parse(xmlhttp.responseText));
      onSuccess.call(this, styleName);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this, opt_requestHeaders);
  }
  _createStylePayload(styleName) {
    return  '<style><name>' + styleName + '</name><filename>' + styleName + '.sld</filename></style>';
  }
  _getCreateStyleUrl(layer, opt_proxy) {
    var urlObj = this._getBaseUrl(layer);
    urlObj.set('pathname', urlObj.pathname + this._getTrailingChar(urlObj) + 'styles');
    return util.getProxiedUrl(urlObj.toString(), opt_proxy);
  }
  createStyle(layer, sld, onSuccess, onFailure, opt_proxy, opt_requestHeaders) {
    var url = this._getCreateStyleUrl(layer, opt_proxy);
    var styleName = 'web_sdk_style_' + Math.floor(100000 + Math.random() * 900000);
    util.doPOST(url, this._createStylePayload(styleName), function(xmlhttp) {
      layer.set('styleName', styleName);
      this.updateStyle(url, layer, sld, onSuccess, onFailure);
    }, function(xmlhttp) {
      if (xmlhttp.responseText.indexOf('already exists') !== -1) {
        // retry under a new name
        this.createStyle(url, layer, sld, onSuccess, onFailure);
      } else {
        onFailure.call(this, xmlhttp);
      }
    }, this, undefined, false, opt_requestHeaders);
  }
  _getUpdateStyleUrl(layer, opt_proxy) {
    var urlObj = this._getBaseUrl(layer);
    var styleName = layer.get('styleName');
    if (styleName.indexOf(':') !== -1) {
      var styleInfo = styleName.split(':');
      var workspace = styleInfo[0];
      var name = styleInfo[1];
      // workspaces styles
      urlObj.set('pathname', urlObj.pathname + this._getTrailingChar(urlObj) + 'workspaces/' + workspace + '/styles/' + name);
      return util.getProxiedUrl(urlObj.toString(), opt_proxy);
    } else {
      urlObj.set('pathname', urlObj.pathname + this._getTrailingChar(urlObj) + 'styles/' + layer.get('styleName'));
      return util.getProxiedUrl(urlObj.toString(), opt_proxy);
    }
  }
  updateStyle(layer, sld, onSuccess, onFailure, opt_proxy, opt_requestHeaders) {
    util.doPOST(this._getUpdateStyleUrl(layer, opt_proxy), sld, function(xmlhttp) {
      onSuccess.call(this, xmlhttp);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this, 'application/vnd.ogc.sld+xml; charset=UTF-8', true, opt_requestHeaders);
  }
}

export default new RESTService();
