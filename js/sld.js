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

import {Jsonix} from 'jsonix';
import {XLink_1_0} from '../node_modules/w3c-schemas/lib/XLink_1_0.js';
import {Filter_1_0_0} from '../node_modules/ogc-schemas/lib/Filter_1_0_0.js';
import {GML_2_1_2} from '../node_modules/ogc-schemas/lib/GML_2_1_2.js';
import {SLD_1_0_0} from '../node_modules/ogc-schemas/lib/SLD_1_0_0.js';

var context = new Jsonix.Context([XLink_1_0, Filter_1_0_0, GML_2_1_2, SLD_1_0_0], {
  namespacePrefixes: {
    'http://www.w3.org/1999/xlink': 'xlink',
    'http://www.opengis.net/sld': 'sld',
    'http://www.opengis.net/ogc': 'ogc'
  }
});
var marshaller = context.createMarshaller();

var createFill = function(styleState) {
  return {
    cssParameter: [{
      name: 'fill',
      content: ['#' + styleState.fillColor.hex]
    }, {
      name: 'fill-opacity',
      content: [String(styleState.fillColor.rgb.a)]
    }]
  };
};

var createStroke = function(styleState) {
  return {
    cssParameter: [{
      name: 'stroke',
      content: ['#' + styleState.strokeColor.hex]
    }, {
      name: 'stroke-width',
      content: [String(styleState.strokeWidth)]
    }, {
      name: 'stroke-opacity',
      content: [String(styleState.strokeColor.rgb.a)]
    }]
  };
};

var createPolygonSymbolizer = function(styleState) {
  return {
    name: {
      localPart: 'PolygonSymbolizer',
      namespaceURI: 'http://www.opengis.net/sld'
    },
    value: {
      fill: createFill(styleState),
      stroke: createStroke(styleState)
    }
  };
};

var createRule = function(geometryType, styleState) {
  if (geometryType === 'Polygon') {
    return {
      symbolizer: [
        createPolygonSymbolizer(styleState)
      ]
    };
  }
};

export default {
  createFill,
  createStroke,
  createPolygonSymbolizer: createPolygonSymbolizer,
  createRule: createRule,
  createSLD(layerName, geometryType, rules, styleState) {
    var result = {
      name: {
        namespaceURI: 'http://www.opengis.net/sld',
        localPart: 'StyledLayerDescriptor'
      }
    };
    var ruleContainer = [];
    result.value = {
      version: '1.0.0',
      namedLayerOrUserLayer: [{
        TYPE_NAME: 'SLD_1_0_0.NamedLayer',
        name: layerName,
        namedStyleOrUserStyle: [{
          TYPE_NAME: 'SLD_1_0_0.UserStyle',
          featureTypeStyle: [{
            rule: ruleContainer
          }]
        }]
      }]
    };
    for (var i = rules.length - 1; i >= 0; --i) {
      var rule = rules[i].title;
      var style = styleState[rule];
      ruleContainer.push(createRule(geometryType, style));
    }
    return marshaller.marshalString(result);
  }
};
