/* global describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import WMSService from '../../js/services/WMSService';

raf.polyfill();

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

  it('creates correct GetFeatureInfo url', function() {
    var view = new ol.View();
    var layer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'http://demo.boundlessgeo.com/geoserver/ows/',
        params: {
          LAYERS: 'usa:states'
        }
      })
    });
    view.setResolution(9783.93962050256);
    var url = WMSService.getFeatureInfoUrl(layer, [-12355128.377959318, 4862617.991389772], view, 'application/vnd.ogc.gml');
    assert.equal(url, 'http://demo.boundlessgeo.com/geoserver/ows/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=usa%3Astates&LAYERS=usa%3Astates&INFO_FORMAT=application%2Fvnd.ogc.gml&I=17&J=14&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX=-12523442.714243278%2C2504688.542848654%2C-10018754.171394622%2C5009377.08569731');
  });

});
