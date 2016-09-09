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
import {transformColor} from '../util.js';

class OpenLayersService {
  createStyle(styleState, geometryType) {
    var fill;
    var radius = parseFloat(styleState.symbolSize) / 2;
    if (styleState.hasFill !== false && styleState.fillColor) {
      fill = new ol.style.Fill({
        color: transformColor(styleState.fillColor)
      });
    }
    var stroke;
    if (styleState.hasStroke !== false && styleState.strokeColor) {
      stroke = new ol.style.Stroke({
        color: transformColor(styleState.strokeColor),
        width: styleState.strokeWidth
      });
    }
    var text;
    if (styleState.labelAttribute) {
      text = new ol.style.Text({
        font: styleState.fontSize + 'px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: transformColor(styleState.fontColor)
        })
      });
    }
    var result;
    if (geometryType === 'Polygon') {
      result = new ol.style.Style({
        fill: fill,
        stroke: stroke,
        text: text
      });
    } else if (geometryType === 'LineString') {
      result = new ol.style.Style({
        stroke: stroke,
        text: text
      });
    } else if (geometryType === 'Point') {
      var image;
      if (styleState.symbolType === 'circle') {
        image = new ol.style.Circle({
          fill: fill,
          stroke: stroke,
          radius: radius
        });
      } else if (styleState.symbolType === 'square') {
        image = new ol.style.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          angle: Math.PI / 4
        });
      } else if (styleState.symbolType === 'triangle') {
        image = new ol.style.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 3,
          radius: radius,
          angle: 0
        });
      } else if (styleState.symbolType === 'star') {
        image = new ol.style.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 5,
          radius: radius,
          radius2: 0.5 * radius,
          angle: 0
        });
      } else if (styleState.symbolType === 'cross') {
        image = new ol.style.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          radius2: 0,
          angle: 0
        });
      } else if (styleState.symbolType === 'x') {
        image = new ol.style.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          radius2: 0,
          angle: Math.PI / 4
        });
      }
      result = new ol.style.Style({
        image: image,
        text: text
      });
    }
    return result;
  }
}

export default new OpenLayersService();
