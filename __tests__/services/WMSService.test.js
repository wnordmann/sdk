/* global describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var WMSService = require('../../js/services/WMSService.js');

describe('WMSService', function() {

  it('uses correct GetCapabilities url', function() {
    var url = WMSService.getCapabilitiesUrl('http://localhost/geoserver/ows');
    assert.equal(url, 'http://localhost/geoserver/ows?service=WMS&request=GetCapabilities&version=1.3.0');
  });

  it('uses correct GetStyles url', function() {
    var url = WMSService.getStylesUrl('http://localhost/geoserver/ows', new ol.layer.Tile({name: 'foo'}));
    assert.equal(url, 'http://localhost/geoserver/ows?service=WMS&request=GetStyles&layers=foo&version=1.1.1');
  });

  it('creates correct layer', function() {
    var layer = {
      Name: 'bar',
      EX_GeographicBoundingBox: [-180, -90, 180, 90],
      Style: [{
        LegendURL: [{
          OnlineResource: 'http://foo'
        }]
      }]
    };
    var url = 'http://localhost/geoserver/ows';
    var titleObj = {
      title: 'My Layer',
      empty: false
    };
    var lyr = WMSService.createLayer(layer, url, titleObj);
    assert.equal(lyr instanceof ol.layer.Tile, true);
    assert.equal(lyr.get('title'), titleObj.title);
    assert.equal(lyr.get('id'), layer.Name);
    assert.equal(lyr.get('legendUrl'), 'http://foo');
    assert.equal(lyr.get('EX_GeographicBoundingBox')[0], layer.EX_GeographicBoundingBox[0]);
    assert.equal(lyr.get('EX_GeographicBoundingBox')[1], layer.EX_GeographicBoundingBox[1]);
    assert.equal(lyr.get('EX_GeographicBoundingBox')[2], layer.EX_GeographicBoundingBox[2]);
    assert.equal(lyr.get('EX_GeographicBoundingBox')[3], layer.EX_GeographicBoundingBox[3]);
    assert.equal(lyr.get('popupInfo'), '#AllAttributes');
    var source = lyr.getSource();
    assert.equal(source instanceof ol.source.TileWMS, true);
    assert.equal(source.getUrls()[0], url);
    assert.equal(source.getParams().LAYERS, layer.Name);
  });

});
