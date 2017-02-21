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
import util from '../util';

const sldDefaults = {
  strokeColor: '#000000',
  strokeWidth: 1
};

class OpenLayersService {
  createStyle(styleState, geometryType) {
    var result = [];
    for (var i = 0, ii = styleState.symbolizers.length; i < ii; ++i) {
      var symbolState = styleState.symbolizers[i];
      var fill;
      var radius = parseFloat(symbolState.symbolSize) / 2;
      if (symbolState.hasFill !== false && symbolState.fillColor) {
        fill = new ol.style.Fill({
          color: util.transformColor(symbolState.fillColor)
        });
      }
      var stroke;
      if (symbolState.hasStroke !== false && (symbolState.strokeColor || symbolState.strokeWidth !== undefined)) {
        stroke = new ol.style.Stroke({
          color: symbolState.strokeColor ? util.transformColor(symbolState.strokeColor) : sldDefaults.strokeColor,
          width: symbolState.strokeWidth !== undefined ? symbolState.strokeWidth : sldDefaults.strokeWidth
        });
      }
      var text;
      if (symbolState.labelAttribute) {
        text = new ol.style.Text({
          font: symbolState.fontSize + 'px Calibri,sans-serif',
          fill: symbolState.fontColor ? new ol.style.Fill({
            color: util.transformColor(symbolState.fontColor)
          }) : undefined
        });
      }
      var style;
      if (geometryType === 'Polygon') {
        style = new ol.style.Style({
          fill: fill,
          stroke: stroke,
          text: text
        });
      } else if (geometryType === 'LineString') {
        style = new ol.style.Style({
          stroke: stroke,
          text: text
        });
      } else if (geometryType === 'Point') {
        var image;
        var rotation = symbolState.rotation ? (parseFloat(symbolState.rotation) / 180) * Math.PI : undefined;
        if (symbolState.externalGraphic) {
          image = new ol.style.Icon({
            src: symbolState.externalGraphic,
            rotation: rotation,
            opacity: symbolState.opacity,
            scale: symbolState.symbolSize / Math.max(symbolState.imageWidth, symbolState.imageHeight)
          });
        } else {
          if (symbolState.symbolType === 'circle') {
            image = new ol.style.Circle({
              fill: fill,
              stroke: stroke,
              rotation: rotation,
              radius: radius
            });
          } else if (symbolState.symbolType === 'square') {
            image = new ol.style.RegularShape({
              fill: fill,
              stroke: stroke,
              points: 4,
              radius: radius,
              rotation: rotation,
              angle: Math.PI / 4
            });
          } else if (symbolState.symbolType === 'triangle') {
            image = new ol.style.RegularShape({
              fill: fill,
              stroke: stroke,
              rotation: rotation,
              points: 3,
              radius: radius,
              angle: 0
            });
          } else if (symbolState.symbolType === 'star') {
            image = new ol.style.RegularShape({
              fill: fill,
              stroke: stroke,
              rotation: rotation,
              points: 5,
              radius: radius,
              radius2: 0.5 * radius,
              angle: 0
            });
          } else if (symbolState.symbolType === 'cross') {
            image = new ol.style.RegularShape({
              fill: fill,
              stroke: stroke,
              rotation: rotation,
              points: 4,
              radius: radius,
              radius2: 0,
              angle: 0
            });
          } else if (symbolState.symbolType === 'x') {
            image = new ol.style.RegularShape({
              fill: fill,
              stroke: stroke,
              rotation: rotation,
              points: 4,
              radius: radius,
              radius2: 0,
              angle: Math.PI / 4
            });
          }
        }
        style = new ol.style.Style({
          image: image,
          text: text
        });
      }
      result.push(style);
    }
    return result;
  }
}

export default new OpenLayersService();
