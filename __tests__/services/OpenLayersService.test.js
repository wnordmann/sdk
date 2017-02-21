/* global beforeEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import OpenLayersService from '../../js/services/OpenLayersService';

raf.polyfill();

describe('OpenLayersService', function() {

  var styleState, geometryType;

  beforeEach(function() {
    styleState = {
      symbolizers: [{
        labelAttribute: 'NAME10',
        fontColor: {
          hex: '000000',
          rgb: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
          }
        },
        fontSize: '12'
      }, {
        fillColor: {
          hex: '1f3dc5',
          rgb: {
            a: 0.5,
            r: 31,
            g: 61,
            b: 197
          }
        },
        strokeColor: {
          hex: 'bb2828',
          rgb: {
            b: 40,
            g: 40,
            r: 187
          }
        }
      }]
    };
    geometryType = 'Polygon';
  });

  it('creates the correct style for polygon', function() {
    var style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.length, 2);
    assert.equal(style[0] instanceof ol.style.Style, true);
    assert.equal(style[1] instanceof ol.style.Style, true);
    var fill = style[1].getFill();
    var fillColor = fill.getColor();
    assert.equal(fillColor[0], 31);
    assert.equal(fillColor[1], 61);
    assert.equal(fillColor[2], 197);
    assert.equal(fillColor[3], 0.5);
    var stroke = style[1].getStroke();
    var strokeColor = stroke.getColor();
    assert.equal(strokeColor[0], 187);
    assert.equal(strokeColor[1], 40);
    assert.equal(strokeColor[2], 40);
    assert.equal(strokeColor[3], undefined);
    var text = style[0].getText();
    assert.equal(text.getFont(), '12px Calibri,sans-serif');
    var fontColor = text.getFill().getColor();
    assert.equal(fontColor[0], 0);
    assert.equal(fontColor[1], 0);
    assert.equal(fontColor[2], 0);
    assert.equal(fontColor[3], 1);
    styleState.symbolizers[1].hasStroke = false;
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style[1].getStroke(), null);
    styleState.symbolizers[1].hasStroke = true;
    styleState.symbolizers[1].hasFill = false;
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style[1].getFill(), null);
  });

  it('creates the correct style for point', function() {
    styleState.symbolizers[1].externalGraphic = 'http://myimage.png';
    geometryType = 'Point';
    var style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style[1].getImage() instanceof ol.style.Icon, true);
    delete styleState.symbolizers[1].externalGraphic;
    styleState.symbolizers[1].symbolType = 'circle';
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style[1].getImage() instanceof ol.style.Circle, true);
    styleState.symbolizers[1].symbolType = 'square';
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style[1].getImage() instanceof ol.style.RegularShape, true);
  });

});
