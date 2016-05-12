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
import {doGET, doPOST} from '../util.js';
import {Jsonix} from 'jsonix';
import URL from 'url-parse';
import {XSD_1_0} from 'w3c-schemas/lib/XSD_1_0.js';
import {XLink_1_0} from 'w3c-schemas/lib/XLink_1_0.js';
import {OWS_1_0_0} from 'ogc-schemas/lib/OWS_1_0_0.js';
import {Filter_1_1_0} from 'ogc-schemas/lib/Filter_1_1_0.js';
import {SMIL_2_0} from 'ogc-schemas/lib/SMIL_2_0.js';
import {SMIL_2_0_Language} from 'ogc-schemas/lib/SMIL_2_0_Language.js';
import {GML_3_1_1} from 'ogc-schemas/lib/GML_3_1_1.js';
import {WFS_1_1_0} from 'ogc-schemas/lib/WFS_1_1_0.js';

const wfsFormat = new ol.format.WFS();
const xmlSerializer = new XMLSerializer();
const wfsContext = new Jsonix.Context([OWS_1_0_0, Filter_1_1_0, SMIL_2_0, SMIL_2_0_Language, XLink_1_0, GML_3_1_1, WFS_1_1_0]);
const wfsUnmarshaller = wfsContext.createUnmarshaller();
const xsdContext = new Jsonix.Context([XSD_1_0]);
const xsdUnmarshaller = xsdContext.createUnmarshaller();

class WFSService {
  getCapabilities(url, onSuccess, onFailure) {
    var layers = [];
    return doGET(url, function(xmlhttp) {
      var info = wfsUnmarshaller.unmarshalDocument(xmlhttp.responseXML).value;
      if (info && info.featureTypeList && info.featureTypeList.featureType) {
        for (var i = 0, ii = info.featureTypeList.featureType.length; i < ii; ++i) {
          var ft = info.featureTypeList.featureType[i];
          var layer = {};
          layer.Name = ft.name.prefix + ':' + ft.name.localPart;
          layer.Title = ft.title;
          layer.Abstract = ft._abstract;
          layer.EX_GeographicBoundingBox = [
            ft.wgs84BoundingBox[0].lowerCorner[0],
            ft.wgs84BoundingBox[0].lowerCorner[1],
            ft.wgs84BoundingBox[0].upperCorner[0],
            ft.wgs84BoundingBox[0].upperCorner[1]
          ];
          layers.push(layer);
        }
      }
      onSuccess.call(this, {Title: info.serviceIdentification.title, Layer: layers});
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
  describeFeatureType(url, layer, onSuccess, onFailure) {
    var dftUrl = new URL(url);
    dftUrl.set('pathname', dftUrl.pathname.replace('wms', 'wfs'));
    dftUrl.set('query', {
      service: 'WFS',
      request: 'DescribeFeatureType',
      version: '1.0.0',
      typename: layer.Name
    });
    doGET(dftUrl.toString(), function(xmlhttp) {
      if (xmlhttp.responseText.indexOf('ServiceExceptionReport') === -1) {
        var schema = xsdUnmarshaller.unmarshalString(xmlhttp.responseText).value;
        var element = schema.complexType[0].complexContent.extension.sequence.element;
        var geometryType, geometryName;
        var attributes = [];
        for (var i = 0, ii = element.length; i < ii; ++i) {
          var el = element[i];
          if (el.type.namespaceURI === 'http://www.opengis.net/gml') {
            geometryName = el.name;
            var lp = el.type.localPart;
            geometryType = lp.replace('PropertyType', '');
          } else if (el.name !== 'boundedBy') {
            // TODO if needed, use attribute type as well
            attributes.push(el.name);
          }
        }
        attributes.sort(function(a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        onSuccess.call(this, {
          featureNS: schema.targetNamespace,
          featurePrefix: layer.Name.split(':').shift(),
          featureType: schema.element[0].name,
          geometryType: geometryType,
          geometryName: geometryName,
          attributes: attributes,
          url: url.replace('wms', 'wfs')
        });
      } else {
        onFailure.call(this);
      }
    }, function(xmlhttp) {
      onFailure.call(this);
    }, this);
  }
  loadFeatures(layer, startIndex, maxFeatures, srsName, onSuccess, onFailure) {
    var wfsInfo = layer.get('wfsInfo');
    var url = wfsInfo.url;
    var payloadNode = wfsFormat.writeGetFeature({
      maxFeatures: maxFeatures,
      srsName: srsName,
      featureNS: wfsInfo.featureNS,
      startIndex: startIndex,
      featurePrefix:  wfsInfo.featurePrefix,
      featureTypes: [wfsInfo.featureType]
    });
    var payload = xmlSerializer.serializeToString(payloadNode);
    doPOST(url, payload, function(xmlhttp) {
      var data = xmlhttp.responseXML;
      this.readResponse(data, xmlhttp, function(data) {
        var features = wfsFormat.readFeatures(data);
        onSuccess.call(this, features);
      }, onFailure);
    }, function(xmlhttp) {
      onFailure.call(this);
    }, this);
  }
  getNumberOfFeatures(layer, callback) {
    if (layer.get('numberOfFeatures') === undefined) {
      var wfsInfo = layer.get('wfsInfo');
      var url = wfsInfo.url;
      var hitsNode = wfsFormat.writeGetFeature({
        resultType: 'hits',
        featureNS: wfsInfo.featureNS,
        featurePrefix:  wfsInfo.featurePrefix,
        featureTypes: [wfsInfo.featureType]
      });
      var hits = xmlSerializer.serializeToString(hitsNode);
      doPOST(url, hits, function(xmlhttp) {
        var info = wfsFormat.readFeatureCollectionMetadata(xmlhttp.responseXML);
        callback.call(this, info.numberOfFeatures);
      });
    }
  }
  bboxFilter(layer, view, extent, onSuccess, onFailure) {
    var wfsInfo = layer.get('wfsInfo');
    var url = new URL(wfsInfo.url);
    var srs = view.getProjection().getCode();
    url.set('query', {
      service: 'WFS',
      request: 'GetFeature',
      version : '1.1.0',
      srsName: srs,
      typename: wfsInfo.featureType,
      bbox: extent.join(',') + ',' + srs
    });
    return doGET(url.toString(), function(xmlhttp) {
      var features = wfsFormat.readFeatures(xmlhttp.responseXML);
      onSuccess.call(this, features);
    }, onFailure);
  }
  distanceWithin(layer, view, coord, onSuccess, onFailure) {
    var point = ol.proj.toLonLat(coord);
    var wfsInfo = layer.get('wfsInfo');
    var url = new URL(wfsInfo.url);
    url.set('query', {
      service: 'WFS',
      request: 'GetFeature',
      version : '1.1.0',
      srsName: view.getProjection().getCode(),
      typename: wfsInfo.featureType,
      cql_filter: 'DWITHIN(' + wfsInfo.geometryName + ', Point(' + point[1] + ' ' + point[0] + '), 0.1, meters)'
    });
    return doGET(url.toString(), function(xmlhttp) {
      var features = wfsFormat.readFeatures(xmlhttp.responseXML);
      if (features.length > 0) {
        onSuccess.call(this, features[0]);
      } else {
        onFailure.call(this);
      }
    }, onFailure);
  }
  readResponse(data, xmlhttp, onSuccess, onFailure) {
    if (global.Document && data instanceof global.Document && data.documentElement &&
      data.documentElement.localName == 'ExceptionReport') {
      if (onFailure) {
        onFailure.call(this, xmlhttp, data.getElementsByTagNameNS('http://www.opengis.net/ows', 'ExceptionText').item(0).textContent);
      }
    } else {
      onSuccess(data);
    }
  }
  deleteFeature(layer, feature, onSuccess, onFailure) {
    var wfsInfo = layer.get('wfsInfo');
    var node = wfsFormat.writeTransaction(null, null, [feature], {
      featureNS: wfsInfo.featureNS,
      featureType: wfsInfo.featureType
    });
    return doPOST(wfsInfo.url, xmlSerializer.serializeToString(node),
      function(xmlhttp) {
        var data = xmlhttp.responseXML;
        this.readResponse(data, xmlhttp, function(data) {
          var result = wfsFormat.readTransactionResponse(data);
          if (result && result.transactionSummary.totalDeleted === 1) {
            onSuccess.call(this);
          } else {
            onFailure.call(this, xmlhttp);
          }
        }, onFailure);
      },
      onFailure,
      this
    );
  }
  updateFeature(layer, view, feature, values, onSuccess, onFailure) {
    var wfsInfo = layer.get('wfsInfo');
    var fid = feature.getId();
    var clone;
    var featureGeometryName = feature.getGeometryName();
    if (values !== null) {
      clone = new ol.Feature(values);
    } else {
      var properties = feature.getProperties();
      // get rid of boundedBy which is not a real property
      // get rid of bbox (in the case of GeoJSON)
      delete properties.boundedBy;
      delete properties.bbox;
      if (wfsInfo.geometryName !== featureGeometryName) {
        properties[wfsInfo.geometryName] = properties[featureGeometryName];
        delete properties[featureGeometryName];
      }
      clone = new ol.Feature(properties);
    }
    clone.setId(fid);
    if (view !== null && wfsInfo.geometryName !== featureGeometryName) {
      clone.setGeometryName(wfsInfo.geometryName);
    }
    var node = wfsFormat.writeTransaction(null, [clone], null, {
      gmlOptions: view !== null ? {
        srsName: view.getProjection().getCode()
      } : undefined,
      featureNS: wfsInfo.featureNS,
      featureType: wfsInfo.featureType
    });
    return doPOST(wfsInfo.url, xmlSerializer.serializeToString(node),
      function(xmlhttp) {
        var data = xmlhttp.responseXML;
        this.readResponse(data, xmlhttp, function(data) {
          var result = wfsFormat.readTransactionResponse(data);
          if (result) {
            onSuccess.call(this, result);
          } else {
            onFailure.call(this, xmlhttp);
          }
        }, onFailure);
      },
      onFailure,
      this
    );
  }
  insertFeature(layer, view, feature, onSuccess, onFailure) {
    var wfsInfo = layer.get('wfsInfo');
    var node = wfsFormat.writeTransaction([feature], null, null, {
      gmlOptions: {
        srsName: view.getProjection().getCode()
      },
      featureNS: wfsInfo.featureNS,
      featureType: wfsInfo.featureType
    });
    return doPOST(wfsInfo.url, xmlSerializer.serializeToString(node),
      function(xmlhttp) {
        var data = xmlhttp.responseXML;
        this.readResponse(data, xmlhttp, function(data) {
          var result = wfsFormat.readTransactionResponse(data);
          if (result) {
            var insertId = result.insertIds[0];
            onSuccess.call(this, insertId);
          } else {
            onFailure.call(this, xmlhttp);
          }
        }, onFailure);
      },
      onFailure,
      this
    );
  }
}

export default new WFSService();
