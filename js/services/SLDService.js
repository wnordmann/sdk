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
import {XLink_1_0} from 'w3c-schemas/lib/XLink_1_0';
import {Filter_1_0_0} from 'ogc-schemas/lib/Filter_1_0_0';
import {GML_2_1_2} from 'ogc-schemas/lib/GML_2_1_2';
import {SLD_1_0_0} from 'ogc-schemas/lib/SLD_1_0_0_GeoServer';
import util from '../util';

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

// make sure <= is on top of < etc.
const comparisonOps = {
  '==': 'PropertyIsEqualTo',
  '>=': 'PropertyIsGreaterThanOrEqualTo',
  '<=': 'PropertyIsLessThanOrEqualTo',
  '>' : 'PropertyIsGreaterThan',
  '<' : 'PropertyIsLessThan'
};

class SLDService {
  parse(sld) {
    var result = {rules: []};
    var info = unmarshaller.unmarshalString(sld).value;
    var layer = info.namedLayerOrUserLayer[0];
    result.layerName = layer.name;
    var namedStyleOrUserStyle = layer.namedStyleOrUserStyle[0];
    result.styleName = namedStyleOrUserStyle.name;
    result.styleTitle = namedStyleOrUserStyle.title;
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
      // TODO does it make sense to keep symbolizers separate?
      Object.assign(rule, this.parseSymbolizer(ruleObj.symbolizer[i]));
    }
    if (ruleObj.filter) {
      rule.expression = this.filterToExpression(ruleObj.filter);
    }
    return rule;
  }
  parseComparisonOps(op) {
    var name, value, operator;
    for (var key in comparisonOps) {
      if (comparisonOps[key] === op.name.localPart) {
        operator = key;
        break;
      }
    }
    for (var i = 0, ii = op.value.expression.length; i < ii; ++i) {
      var expr = op.value.expression[i];
      if (expr.name.localPart === 'PropertyName') {
        name = expr.value.content[0];
      }
      if (expr.name.localPart === 'Literal') {
        value = expr.value.content[0];
      }
    }
    if (name !== undefined && value !== undefined && operator !== undefined) {
      return name + ' ' + operator + ' ' + value;
    }
  }
  parseLogicOps(logicOps) {
    var expressions = [];
    // TODO other logical operators
    if (logicOps.name.localPart === 'And') {
      for (var i = 0, ii = logicOps.value.ops.length; i < ii; ++i) {
        var op = logicOps.value.ops[i];
        // TODO this can be another logical as well
        expressions.push(this.parseComparisonOps(op));
      }
      return expressions.join(' ' + logicOps.name.localPart.toLowerCase() + ' ');
    }
  }
  filterToExpression(filter) {
    if (filter.comparisonOps) {
      return this.parseComparisonOps(filter.comparisonOps);
    } else if (filter.logicOps) {
      return this.parseLogicOps(filter.logicOps);
    }
  }
  parseSymbolizer(symbolizerObj) {
    if (symbolizerObj.name.localPart === 'PolygonSymbolizer') {
      return this.parsePolygonSymbolizer(symbolizerObj.value);
    } else if (symbolizerObj.name.localPart === 'LineSymbolizer') {
      return this.parseLineSymbolizer(symbolizerObj.value);
    } else if (symbolizerObj.name.localPart === 'PointSymbolizer') {
      return this.parsePointSymbolizer(symbolizerObj.value);
    } else if (symbolizerObj.name.localPart === 'TextSymbolizer') {
      return this.parseTextSymbolizer(symbolizerObj.value);
    }
  }
  parseTextSymbolizer(textObj) {
    var result = {};
    var labelInfo = textObj.label.content[0].value;
    if (labelInfo.TYPE_NAME === 'Filter_1_0_0.PropertyNameType') {
      result.labelAttribute = labelInfo.content[0];
    }
    if (textObj.vendorOption) {
      result.vendorOption = textObj.vendorOption;
    }
    if (textObj.labelPlacement) {
      if (textObj.labelPlacement.pointPlacement) {
        var anchorPoint = textObj.labelPlacement.pointPlacement.anchorPoint;
        var displacement = textObj.labelPlacement.pointPlacement.displacement;
        result.labelPlacement = {
          type: 'POINT',
          anchorPoint: [anchorPoint.anchorPointX.content[0], anchorPoint.anchorPointY.content[0]],
          displacement: [displacement.displacementX.content[0], displacement.displacementY.content[0]]
        };
        if (textObj.labelPlacement.pointPlacement.rotation !== undefined) {
          result.labelPlacement.rotation = textObj.labelPlacement.pointPlacement.rotation.content[0];
        }
      }
    }
    if (textObj.font && textObj.font.cssParameter) {
      for (var i = 0, ii = textObj.font.cssParameter.length; i < ii; ++i) {
        var param = textObj.font.cssParameter[i];
        if (param.name === 'font-size') {
          result.fontSize = param.content[0];
        } else if (param.name === 'font-family') {
          result.fontFamily = param.content[0];
        } else if (param.name === 'font-style') {
          result.fontStyle = param.content[0];
        } else if (param.name === 'font-weight') {
          result.fontWeight = param.content[0];
        }
      }
    }
    if (textObj.fill) {
      result.fontColor = this.parseFill(textObj.fill);
    }
    return result;
  }
  parsePointSymbolizer(pointObj) {
    var result = {};
    if (pointObj.graphic.opacity) {
      result.opacity = parseFloat(pointObj.graphic.opacity.content[0]);
    }
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
        result.symbolType = externalGraphicOrMark.wellKnownName.content[0];
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
        fillColor.hex = fillObj.cssParameter[i].content[0];
        fillColor.rgb = util.hexToRgb(fillColor.hex);
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
            hex: strokeObj.cssParameter[i].content[0],
            rgb: util.hexToRgb(strokeObj.cssParameter[i].content[0])
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
    var cssParameter = [{
      name: 'fill',
      content: [styleState.fillColor.hex]
    }];
    if (styleState.fillColor.rgb.a !== undefined) {
      cssParameter.push({
        name: 'fill-opacity',
        content: [String(styleState.fillColor.rgb.a)]
      });
    }
    return {
      cssParameter: cssParameter
    };
  }
  createStroke(styleState) {
    var cssParameters = [];
    if (styleState.strokeColor) {
      cssParameters.push({
        name: 'stroke',
        content: [styleState.strokeColor.hex]
      });
      if (styleState.strokeColor.rgb.a !== undefined) {
        cssParameters.push({
          name: 'stroke-opacity',
          content: [String(styleState.strokeColor.rgb.a)]
        });
      }
    }
    if (styleState.strokeWidth !== undefined) {
      cssParameters.push({
        name: 'stroke-width',
        content: [String(styleState.strokeWidth)]
      });
    }
    if (cssParameters.length > 0) {
      return {
        cssParameter: cssParameters
      };
    } else {
      return undefined;
    }
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
        wellKnownName: [styleState.symbolType]
      }];
    }
    var result = {
      name: {
        localPart: 'PointSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        graphic: {
          externalGraphicOrMark: graphicOrMark,
          size: {
            content: [styleState.symbolSize]
          }
        }
      }
    };
    if (styleState.rotation !== undefined) {
      result.value.graphic.rotation = [styleState.rotation];
    }
    if (styleState.externalGraphic && styleState.opacity !== undefined) {
      result.value.graphic.opacity = {
        content: ['' + styleState.opacity]
      };
    }
    return result;
  }
  createTextSymbolizer(styleState) {
    var cssParameter = [];
    if (styleState.fontFamily) {
      cssParameter.push({
        name: 'font-family',
        content: [styleState.fontFamily]
      });
    }
    if (styleState.fontSize) {
      cssParameter.push({
        name: 'font-size',
        content: [String(styleState.fontSize)]
      });
    }
    if (styleState.fontStyle) {
      cssParameter.push({
        name: 'font-style',
        content: [styleState.fontStyle]
      });
    }
    if (styleState.fontWeight) {
      cssParameter.push({
        name: 'font-weight',
        content: [styleState.fontWeight]
      });
    }
    var result = {
      name: {
        localPart: 'TextSymbolizer',
        namespaceURI: sldNamespace
      },
      value: {
        fill: styleState.fontColor ? {
          cssParameter: [{
            name: 'fill',
            content: [styleState.fontColor.hex]
          }]
        } : undefined,
        font: cssParameter.length > 0 ? {
          cssParameter: cssParameter
        } : undefined,
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
        },
        vendorOption: styleState.vendorOption
      }
    };
    if (styleState.labelPlacement) {
      if (styleState.labelPlacement.type === 'POINT') {
        result.value.labelPlacement = {
          pointPlacement: {
            anchorPoint: {
              anchorPointX: {
                content: [String(styleState.labelPlacement.anchorPoint[0])]
              },
              anchorPointY: {
                content: [String(styleState.labelPlacement.anchorPoint[1])]
              }
            },
            displacement: {
              displacementX: {
                content: [String(styleState.labelPlacement.displacement[0])]
              },
              displacementY: {
                content: [String(styleState.labelPlacement.displacement[1])]
              }
            }
          }
        };
        if (styleState.labelPlacement.rotation !== undefined) {
          result.value.labelPlacement.pointPlacement.rotation = {
            content: [String(styleState.labelPlacement.rotation)]
          };
        }
      }
    }
    return result;
  }
  expressionToFilter(expression) {
    // TODO handle more
    if (expression.indexOf('and') !== -1) {
      var expressions = expression.split(' and ');
      var result = {
        logicOps: {
          name: {
            namespaceURI: ogcNamespace,
            localPart: 'And'
          },
          value: {
            ops: []
          }
        }
      };
      for (var i = 0, ii = expressions.length; i < ii; ++i) {
        result.logicOps.value.ops.push(this.expressionToComparisonOp(expressions[i]).comparisonOps);
      }
      return result;
    } else {
      return this.expressionToComparisonOp(expression);
    }
  }
  expressionToComparisonOp(expression) {
    // TODO support more (complex) filters, maybe using jison
    var operator, property, value;
    for (var key in comparisonOps) {
      var idx = expression.indexOf(key);
      if (idx !== -1) {
        operator = comparisonOps[key];
        property = expression.substring(0, idx).trim();
        value = expression.substring(idx + key.length).replace(/"/g, '').trim();
        break;
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
  createSLD(layer, geometryType, rules) {
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
          title: styleInfo ? styleInfo.styleTitle : undefined,
          featureTypeStyle: [{
            name: styleInfo ? styleInfo.featureTypeStyleName : undefined,
            rule: ruleContainer
          }]
        }]
      }]
    };
    for (var i = 0, ii = rules.length; i < ii; ++i) {
      var rule = rules[i].name;
      var style = rules[i];
      ruleContainer.push(this.createRule(rule, style.title, geometryType, style));
    }
    return marshaller.marshalString(result);
  }
}

export default new SLDService();
