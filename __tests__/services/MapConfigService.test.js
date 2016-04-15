/* global describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var MapConfigService = require('../../js/services/MapConfigService.js');

describe('MapConfigService', function() {

  it('returns the correct layer type', function() {
    var type = MapConfigService.getLayerType(new ol.layer.Group());
    assert.equal(type, 'Group');
    type = MapConfigService.getLayerType(new ol.layer.Vector());
    assert.equal(type, 'Vector');
    type = MapConfigService.getLayerType(new ol.layer.Tile());
    assert.equal(type, 'Tile');
    type = MapConfigService.getLayerType(new ol.layer.Image());
    assert.equal(type, 'Image');
  });

  it('returns the correct format type', function() {
    var type = MapConfigService.getFormatType(new ol.format.GeoJSON());
    assert.equal(type, 'GeoJSON');
  });

  it('returns the correct source config for TileWMS', function() {
    var source = new ol.source.TileWMS({
      url: '/geoserver/wms',
      params: {
        LAYERS: 'foo'
      }
    });
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'TileWMS');
    assert.equal(config.properties.params.LAYERS, 'foo');
    assert.equal(config.properties.urls[0], '/geoserver/wms');
  });

  it('returns the correct source config for Vector', function() {
    var source = new ol.source.Vector({
      url: '/test.json',
      format: new ol.format.GeoJSON()
    });
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'Vector');
    assert.equal(config.properties.url, '/test.json');
    assert.equal(config.properties.format.type, 'GeoJSON');
  });

});
