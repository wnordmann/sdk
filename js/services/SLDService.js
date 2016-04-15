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
import {XLink_1_0} from '../../node_modules/w3c-schemas/lib/XLink_1_0.js';
import {Filter_1_0_0} from '../../node_modules/ogc-schemas/lib/Filter_1_0_0.js';
import {GML_2_1_2} from '../../node_modules/ogc-schemas/lib/GML_2_1_2.js';
import {SLD_1_0_0} from '../../node_modules/ogc-schemas/lib/SLD_1_0_0.js';

const sldNamespace = 'http://www.opengis.net/sld';
const ogcNamespace = 'http://www.opengis.net/ogc';

var context = new Jsonix.Context([XLink_1_0, Filter_1_0_0, GML_2_1_2, SLD_1_0_0], {
  namespacePrefixes: {
    'http://www.w3.org/1999/xlink': 'xlink',
    'http://www.opengis.net/sld': 'sld',
    'http://www.opengis.net/ogc': 'ogc'
  }
});
var marshaller = context.createMarshaller();

class SLDService {
  createFill(styleState) {
    return {
      cssParameter: [{
        name: 'fill',
        content: ['#' + styleState.fillColor.hex]
      }, {
        name: 'fill-opacity',
        content: [String(styleState.fillColor.rgb.a)]
      }]
    };
  }
  createStroke(styleState) {
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
  }
  createPolygonSymbolizer(styleState) {
    return {
      name: {
        localPart: 'PolygonSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        fill: this.createFill(styleState),
        stroke: this.createStroke(styleState)
      }
    };
  }
  createLineSymbolizer(styleState) {
    return {
      name: {
        localPart: 'LineSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        stroke: this.createStroke(styleState)
      }
    };
  }
  createPointSymbolizer(styleState) {
    var graphicOrMark = [{
      TYPE_NAME: 'SLD_1_0_0.Mark',
      fill: this.createFill(styleState),
      stroke: this.createStroke(styleState),
      wellKnownName: 'circle'
    }];
    return {
      name: {
        localPart: 'PointSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        graphic: {
          externalGraphicOrMark: graphicOrMark,
          size: {
            content: ['4']
          }
        }
      }
    };
  }
  createTextSymbolizer(styleState) {
    var fontFamily = 'sans-serif';
    return {
      name: {
        localPart: 'TextSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        fill: {
          cssParameter: [{
            name: 'fill',
            content: ['#' + styleState.fontColor.hex]
          }]
        },
        halo: {
          fill: {
            cssParameter: [{
              name: 'fill',
              content: ['#FFFFFF']
            }]
          },
          radius: {
            content: ['1']
          }
        },
        labelPlacement: {
          linePlacement: {}
        },
        font: {
          cssParameter: [{
            name: 'font-family',
            content: [fontFamily]
          }, {
            name: 'font-size',
            content: [String(styleState.fontSize)]
          }]
        },
        label: {
          content: [{
            name: {
              localPart: 'PropertyName',
              namespaceURI: ogcNamespace
            },
            value: {
              content: [styleState.labelAttribute]
            }
          }]
        }
      }
    };
  }
  expressionToFilter(expression) {
    // TODO support more (complex) filters, but filtrex does not export its parser
    var comparisonOps = {
      '==': 'PropertyIsEqualTo',
      '>=': 'PropertyIsGreaterThanOrEqualTo',
      '>' : 'PropertyIsGreaterThan',
      '<' : 'PropertyIsLessThan',
      '<=': 'PropertyIsLessThanOrEqualTo'
    };
    var operator, property, value;
    for (var key in comparisonOps) {
      var idx = expression.indexOf(key);
      if (idx !== -1) {
        operator = comparisonOps[key];
        property = expression.substring(0, idx).trim();
        value = expression.substring(idx + key.length).replace(/"/g, '').trim();
      }
    }
    if (operator) {
      return {
        comparisonOps: {
          name: {
            namespaceURI: ogcNamespace,
            localPart: operator
          },
          value: {
            expression: [{
              name: {
                namespaceURI: ogcNamespace,
                localPart: 'PropertyName'
              },
              value: {
                content: [property]
              }
            }, {
              name: {
                namespaceURI: ogcNamespace,
                localPart: 'Literal'
              },
              value: {
                content: [String(value)]
              }
            }]
          }
        }
      };
    }
  }
  createRule(geometryType, styleState) {
    var filter;
    if (styleState.expression) {
      filter = this.expressionToFilter(styleState.expression);
    }
    var symbolizer = [];
    if (geometryType === 'Polygon') {
      symbolizer.push(this.createPolygonSymbolizer(styleState));
    } else if (geometryType === 'LineString') {
      symbolizer.push(this.createLineSymbolizer(styleState));
    } else if (geometryType === 'Point') {
      symbolizer.push(this.createPointSymbolizer(styleState));
    }
    if (styleState.labelAttribute) {
      symbolizer.push(this.createTextSymbolizer(styleState));
    }
    return {
      symbolizer: symbolizer,
      filter: filter
    };
  }
  createSLD(layerName, geometryType, rules, styleState) {
    var result = {
      name: {
        namespaceURI: sldNamespace,
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
      ruleContainer.push(this.createRule(geometryType, style));
    }
    return marshaller.marshalString(result);
  }
}

export default new SLDService();
