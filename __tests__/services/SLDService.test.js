/* global beforeEach, describe, it */

var assert = require('chai').assert;

var SLDService = require('../../js/services/SLDService.js');

describe('SLDService', function() {

  var fillColor, strokeColor;

  beforeEach(function() {
    fillColor = {
      hex: 'FF0000',
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      }
    }
    strokeColor = {
      hex: 'FF0000',
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      }
    };
  });

  it('creates the correct fill', function() {
    var fill = SLDService.createFill({
      fillColor: fillColor
    });
    for (var i, ii = fill.cssParameter.length; i < ii; ++i) {
      var key = fill.cssParameter[i].name;
      if (key === 'fill') {
        assert.equal(fill.cssParameter[i].content[0], '#FF0000');
      }
      if (key === 'fill-opacity') {
        assert.equal(fill.cssParameter[i].content[0], '0.5');
      }
    }
  });

  it('creates the correct stroke', function() {
    var stroke = SLDService.createStroke({
      strokeColor: strokeColor,
      strokeWidth: 2
    });
    for (var i, ii = stroke.cssParameter.length; i < ii; ++i) {
      var key = stroke.cssParameter[i].name;
      if (key === 'stroke') {
        assert.equal(stroke.cssParameter[i].content[0], '#FF0000');
      }
      if (key === 'stroke-width') {
        assert.equal(stroke.cssParameter[i].content[0], '2');
      }
      if (key === 'stroke-opacity') {
        assert.equal(stroke.cssParameter[i].content[0], '0.5');
      }
    }
  });

  it('creates a polygon symbolizer', function() {
    var symbol = SLDService.createPolygonSymbolizer({
      strokeColor: strokeColor,
      strokeWidth: 2,
      fillColor: fillColor
    });
    assert.equal(symbol.name.localPart, 'PolygonSymbolizer');
    assert.equal(symbol.value.fill !== undefined, true);
    assert.equal(symbol.value.stroke !== undefined, true);
  });

  it('creates a line symbolizer', function() {
    var symbol = SLDService.createLineSymbolizer({
      strokeColor: strokeColor,
      strokeWidth: 2
    });
    assert.equal(symbol.name.localPart, 'LineSymbolizer');
    assert.equal(symbol.value.fill === undefined, true);
    assert.equal(symbol.value.stroke !== undefined, true);
  });

  it('creates a point symbolizer', function() {
    var symbol = SLDService.createPointSymbolizer({
      strokeColor: strokeColor,
      fillColor: fillColor,
      symbolType: 'circle',
      symbolSize: '4'
    });
    assert.equal(symbol.name.localPart, 'PointSymbolizer');
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].wellKnownName, 'circle');
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].fill !== undefined, true);
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].stroke !== undefined, true);
    assert.equal(symbol.value.graphic.size.content[0], '4');
  });

});
