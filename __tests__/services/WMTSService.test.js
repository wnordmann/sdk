/* global beforeEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var WMTSService = require('../../js/services/WMTSService.js');

describe('WMTSService', function() {

  var layer, view;

  beforeEach(function() {
    var projection = ol.proj.get('EPSG:3857');
    var projectionExtent = projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(14);
    var matrixIds = new Array(14);
    for (var z = 0; z < 14; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = 'EPSG:900913:' + z;
    }
    view = new ol.View();
    layer = new ol.layer.Tile({
      title: 'foo',
      popupInfo: '#AllAttributes',
      extent: [ol.proj.fromLonLat([-179.23023299999997, 17.831509000000036])[0], ol.proj.fromLonLat([-179.23023299999997, 17.831509000000036])[1], ol.proj.fromLonLat([-65.16882499999997, 71.437769])[0], ol.proj.fromLonLat([-65.16882499999997, 71.437769])[1]],
      source: new ol.source.WMTS({
        url: 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts?',
        layer: 'usa:states',
        matrixSet: 'EPSG:900913',
        format: 'image/png',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: ''
      })
    });
    view.setResolution(9783.93962050256);
  });

  it('creates the correct GetFeatureInfo url', function() {
    var url = WMTSService.getFeatureInfoUrl(layer, [-12355128.377959318, 4862617.991389772], view, 'application/vnd.ogc.gml');
    assert.equal(url, 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts?service=WMTS&request=GetFeatureInfo&version=1.0.0&layer=usa%3Astates&infoformat=application%2Fvnd.ogc.gml&style=&format=image%2Fpng&tilecol=3&tilerow=6&tilematrix=EPSG%3A900913%3A4&tilematrixset=EPSG%3A900913&i=17&j=15');
  });

});
