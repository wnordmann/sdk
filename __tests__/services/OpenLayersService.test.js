/* global beforeEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var OpenLayersService = require('../../js/services/OpenLayersService.js');

describe('OpenLayersService', function() {

  var styleState, geometryType;

  beforeEach(function() {
    styleState = {
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
      fontSize: '12',
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
    };
    geometryType = 'Polygon';
  });

  it('creates the correct style for polygon', function() {
    var style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style instanceof ol.style.Style, true);
    var fill = style.getFill();
    var fillColor = fill.getColor();
    assert.equal(fillColor[0], 31);
    assert.equal(fillColor[1], 61);
    assert.equal(fillColor[2], 197);
    assert.equal(fillColor[3], 0.5);
    var stroke = style.getStroke();
    var strokeColor = stroke.getColor();
    assert.equal(strokeColor[0], 187);
    assert.equal(strokeColor[1], 40);
    assert.equal(strokeColor[2], 40);
    assert.equal(strokeColor[3], undefined);
    var text = style.getText();
    assert.equal(text.getFont(), '12px Calibri,sans-serif');
    var fontColor = text.getFill().getColor();
    assert.equal(fontColor[0], 0);
    assert.equal(fontColor[1], 0);
    assert.equal(fontColor[2], 0);
    assert.equal(fontColor[3], 1);
    styleState.hasStroke = false;
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.getStroke(), null);
    styleState.hasStroke = true;
    styleState.hasFill = false;
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.getFill(), null);
  });

  it('creates the correct style for point', function() {
    styleState.externalGraphic = 'http://myimage.png';
    geometryType = 'Point';
    var style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.getImage() instanceof ol.style.Icon, true);
    delete styleState.externalGraphic;
    styleState.symbolType = 'circle';
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.getImage() instanceof ol.style.Circle, true);
    styleState.symbolType = 'square';
    style = OpenLayersService.createStyle(styleState, geometryType);
    assert.equal(style.getImage() instanceof ol.style.RegularShape, true);
  });

});
