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
import {XLink_1_0} from 'w3c-schemas/lib/XLink_1_0.js';
import {Filter_1_0_0} from 'ogc-schemas/lib/Filter_1_0_0.js';
import {GML_2_1_2} from 'ogc-schemas/lib/GML_2_1_2.js';
import {SLD_1_0_0} from 'ogc-schemas/lib/SLD_1_0_0.js';
import {hexToRgb} from '../util.js';

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
var unmarshaller = context.createUnmarshaller();

const graphicFormats = {
  'image/jpeg': /\.jpe?g$/i,
  'image/gif': /\.gif$/i,
  'image/png': /\.png$/i
};

class SLDService {
  parse(sld) {
    var result = {rules: []};
    var info = unmarshaller.unmarshalString(sld).value;
    var layer = info.namedLayerOrUserLayer[0];
    result.layerName = layer.name;
    var namedStyleOrUserStyle = layer.namedStyleOrUserStyle[0];
    result.styleName = namedStyleOrUserStyle.name;
    var featureTypeStyle = namedStyleOrUserStyle.featureTypeStyle[0];
    result.featureTypeStyleName = featureTypeStyle.name;
    for (var i = 0, ii = featureTypeStyle.rule.length; i < ii; ++i) {
      result.rules.push(this.parseRule(featureTypeStyle.rule[i]));
    }
    return result;
  }
  parseRule(ruleObj) {
    var rule = {};
    rule.name = ruleObj.name;
    rule.title = ruleObj.title;
    for (var i = 0, ii = ruleObj.symbolizer.length; i < ii; ++i) {
      Object.assign(rule, this.parseSymbolizer(ruleObj.symbolizer[i]));
    }
    return rule;
  }
  parseSymbolizer(symbolizerObj) {
    if (symbolizerObj.name.localPart === 'PolygonSymbolizer') {
      return this.parsePolygonSymbolizer(symbolizerObj.value);
    } else if (symbolizerObj.name.localPart === 'LineSymbolizer') {
      return this.parseLineSymbolizer(symbolizerObj.value);
    } else if (symbolizerObj.name.localPart === 'PointSymbolizer') {
      return this.parsePointSymbolizer(symbolizerObj.value);
    }
  }
  parsePointSymbolizer(pointObj) {
    var result = {};
    if (pointObj.graphic.rotation) {
      result.rotation = pointObj.graphic.rotation.content[0];
    }
    if (pointObj.graphic.size) {
      result.symbolSize = pointObj.graphic.size.content[0];
    }
    var externalGraphicOrMark = pointObj.graphic.externalGraphicOrMark[0];
    if (externalGraphicOrMark.TYPE_NAME === 'SLD_1_0_0.ExternalGraphic') {
      result.externalGraphic = externalGraphicOrMark.onlineResource.href;
    } else {
      if (externalGraphicOrMark.wellKnownName) {
        result.symbolType = externalGraphicOrMark.wellKnownName;
      }
      var fill = externalGraphicOrMark.fill;
      if (fill) {
        result.fillColor = this.parseFill(fill);
      }
      var stroke = externalGraphicOrMark.stroke;
      if (stroke) {
        Object.assign(result, this.parseStroke(stroke));
      }
    }
    return result;
  }
  parseLineSymbolizer(lineObj) {
    return this.parseStroke(lineObj.stroke);
  }
  parsePolygonSymbolizer(polyObj) {
    var result = {};
    if (polyObj.fill) {
      result.fillColor = this.parseFill(polyObj.fill);
    }
    if (polyObj.stroke) {
      Object.assign(result, this.parseStroke(polyObj.stroke));
    }
    return result;
  }
  parseFill(fillObj) {
    var fillColor = {};
    for (var i = 0, ii = fillObj.cssParameter.length; i < ii; ++i) {
      if (fillObj.cssParameter[i].name === 'fill') {
        fillColor.hex = fillObj.cssParameter[i].content[0].replace('#', '');
        fillColor.rgb = hexToRgb(fillColor.hex);
      } else if (fillObj.cssParameter[i].name === 'fill-opacity') {
        fillColor.rgb = Object.assign(fillColor.rgb, {a :parseFloat(fillObj.cssParameter[i].content[0])});
      }
    }
    return fillColor;
  }
  parseStroke(strokeObj) {
    var stroke = {};
    if (strokeObj.cssParameter) {
      for (var i = 0, ii = strokeObj.cssParameter.length; i < ii; ++i) {
        if (strokeObj.cssParameter[i].name === 'stroke') {
          stroke.strokeColor = {
            hex: strokeObj.cssParameter[i].content[0].replace('#', ''),
            rgb: hexToRgb(strokeObj.cssParameter[i].content[0])
          };
        } else if (strokeObj.cssParameter[i].name === 'stroke-opacity') {
          stroke.strokeColor.rgb = Object.assign(stroke.strokeColor.rgb, {a :parseFloat(strokeObj.cssParameter[i].content[0])});
        } else if (strokeObj.cssParameter[i].name === 'stroke-width') {
          stroke.strokeWidth = parseFloat(strokeObj.cssParameter[i].content[0]);
        }
      }
    }
    return stroke;
  }
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
    var cssParameters = [];
    if (styleState.strokeColor) {
      cssParameters.push({
        name: 'stroke',
        content: ['#' + styleState.strokeColor.hex]
      }, {
        name: 'stroke-opacity',
        content: [String(styleState.strokeColor.rgb.a)]
      });
    }
    if (styleState.strokeWidth !== undefined) {
      cssParameters.push({
        name: 'stroke-width',
        content: [String(styleState.strokeWidth)]
      });
    }
    return {
      cssParameter: cssParameters
    };
  }
  createPolygonSymbolizer(styleState) {
    return {
      name: {
        localPart: 'PolygonSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        fill: styleState.hasFill !== false ? this.createFill(styleState) : undefined,
        stroke: styleState.hasStroke !== false ? this.createStroke(styleState) : undefined
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
  _getGraphicFormat(href) {
    var format;
    for (var key in graphicFormats) {
      if (graphicFormats[key].test(href)) {
        format = key;
        break;
      }
    }
    return format || 'image/png';
  }
  createPointSymbolizer(styleState) {
    var graphicOrMark;
    if (styleState.externalGraphic) {
      graphicOrMark = [{
        TYPE_NAME: 'SLD_1_0_0.ExternalGraphic',
        onlineResource: {href: styleState.externalGraphic},
        format: this._getGraphicFormat(styleState.externalGraphic)
      }];
    } else {
      graphicOrMark = [{
        TYPE_NAME: 'SLD_1_0_0.Mark',
        fill: styleState.hasFill !== false && styleState.fillColor ? this.createFill(styleState) : undefined,
        stroke: styleState.hasStroke !== false ? this.createStroke(styleState) : undefined,
        wellKnownName: styleState.symbolType
      }];
    }
    return {
      name: {
        localPart: 'PointSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        graphic: {
          externalGraphicOrMark: graphicOrMark,
          rotation: {
            content: [styleState.rotation]
          },
          size: {
            content: [styleState.symbolSize]
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
    // TODO support more (complex) filters, maybe using jison
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
  createRule(name, title, geometryType, styleState) {
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
      name: name,
      title: title,
      symbolizer: symbolizer,
      filter: filter
    };
  }
  createSLD(layer, geometryType, rules, styleState) {
    var layerName = layer.get('id');
    var styleInfo = layer.get('styleInfo');
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
          name: styleInfo ? styleInfo.styleName : undefined,
          featureTypeStyle: [{
            name: styleInfo ? styleInfo.featureTypeStyleName : undefined,
            rule: ruleContainer
          }]
        }]
      }]
    };
    for (var i = rules.length - 1; i >= 0; --i) {
      var rule = rules[i].name;
      var style = styleState[rule];
      ruleContainer.push(this.createRule(rule, style.title, geometryType, style));
    }
    return marshaller.marshalString(result);
  }
}

export default new SLDService();
