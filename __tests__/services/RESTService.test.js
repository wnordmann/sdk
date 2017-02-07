/* global beforeEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import RESTService from '../../js/services/RESTService';
import URL from 'url-parse';

raf.polyfill();

describe('RESTService', function() {

  var layer, vector;
  beforeEach(function() {
    layer = new ol.layer.Tile({
      name: 'states',
      source: new ol.source.TileWMS({
        url: 'http://demo.boundlessgeo.com/geoserver/wms'
      })
    });
    var vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function(extent, resolution, projection) {
        return '/geoserver/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=usa:states&' +
          'outputFormat=application/json&srsname=EPSG:3857&' +
          'bbox=' + extent.join(',') + ',EPSG:3857';
      },
      strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 19
      }))
    });
    vector = new ol.layer.Vector({
      source: vectorSource,
      id: 'wfst',
      wfsInfo: {
        featureNS: 'http://census.gov',
        featureType: 'states',
        featurePrefix: 'usa',
        geometryType: 'MultiPolygon',
        geometryName: 'the_geom',
        url: '/geoserver/wfs'
      },
      isWFST: true,
      title: 'WFST layer',
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2
        })
      })
    });
  });

  it('creates the correct url for get style name', function() {
    var styleUrl = RESTService._getStyleNameUrl(layer);
    var expected = 'http://demo.boundlessgeo.com/geoserver/rest/layers/states.json';
    assert.equal(styleUrl, expected);
    var proxy = 'http://proxy/?url=';
    styleUrl = RESTService._getStyleNameUrl(layer, proxy);
    assert.equal(styleUrl, proxy + encodeURIComponent(expected));
  });

  it('creates the correct url for get style name if custom params', function() {
    layer.getSource().setUrl('http://localhost:8080/geoserver/wms?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn');
    var styleUrl = RESTService._getStyleNameUrl(layer);
    var expected = 'http://localhost:8080/geoserver/rest/layers/states.json?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn';
    assert.equal(styleUrl, expected);
  });

  it('parses the style name', function() {
    var response = '{"layer":{"name":"states","type":"VECTOR","defaultStyle":{"name":"states","href":"http:\/\/localhost:8080\/geoserver\/rest\/styles\/states.json"},"resource":{"@class":"featureType","name":"states","href":"http:\/\/localhost:8080\/geoserver\/rest\/workspaces\/usa\/datastores\/states_shp\/featuretypes\/states.json"},"queryable":true,"opaque":false,"attribution":{"logoWidth":0,"logoHeight":0}}}';
    assert.equal(RESTService._parseStyleName(JSON.parse(response)), 'states');
  });

  it('parses the style name correctly when in workspace', function() {
    var response = '{"layer":{"name":"populated_places","type":"VECTOR","defaultStyle":{"name":"populated_places","workspace":"ne","href":"http:\/\/localhost:8080\/geoserver\/rest\/workspaces\/ne\/styles\/populated_places.json"},"resource":{"@class":"featureType","name":"populated_places","href":"http:\/\/localhost:8080\/geoserver\/rest\/workspaces\/ne\/datastores\/Cultural\/featuretypes\/populated_places.json"},"queryable":true,"opaque":false,"attribution":{"logoWidth":0,"logoHeight":0}}}';
    assert.equal(RESTService._parseStyleName(JSON.parse(response)), 'ne:populated_places');
  });

  it('update style url is correct', function() {
    layer.set('styleName', 'states');
    var updateUrl = RESTService._getUpdateStyleUrl(layer);
    assert.equal(updateUrl, 'http://demo.boundlessgeo.com/geoserver/rest/styles/states');
    layer.set('styleName', 'foo:states');
    updateUrl = RESTService._getUpdateStyleUrl(layer);
    var expected = 'http://demo.boundlessgeo.com/geoserver/rest/workspaces/foo/styles/states';
    assert.equal(updateUrl, expected);
  });

  it('update style url is correct with params', function() {
    layer.getSource().setUrl('http://localhost:8080/geoserver/wms?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn');
    layer.set('styleName', 'states');
    var updateUrl = RESTService._getUpdateStyleUrl(layer);
    assert.equal(updateUrl, 'http://localhost:8080/geoserver/rest/styles/states?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn');
  });

  it('update style url is correct with proxy', function() {
    layer.set('styleName', 'foo:states');
    var expected = 'http://demo.boundlessgeo.com/geoserver/rest/workspaces/foo/styles/states';
    var proxy = 'http://proxy/?url=';
    var updateUrl = RESTService._getUpdateStyleUrl(layer, proxy);
    assert.equal(updateUrl, proxy + encodeURIComponent(expected));
  });

  it('create style url is correct', function() {
    var url = RESTService._getCreateStyleUrl(layer);
    assert.equal(url, 'http://demo.boundlessgeo.com/geoserver/rest/styles');
  });

  it('create style url is correct with params', function() {
    layer.getSource().setUrl('http://localhost:8080/geoserver/wms?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn');
    var url = RESTService._getCreateStyleUrl(layer);
    assert.equal(url, 'http://localhost:8080/geoserver/rest/styles?access_token=Qq039tZU0UhzRlK1qpVMY562jI3wAn');
  });

  it('create style url is correct with proxy', function() {
    var proxy = 'http://proxy/?url=';
    var url = RESTService._getCreateStyleUrl(layer, proxy);
    assert.equal(url, proxy + encodeURIComponent('http://demo.boundlessgeo.com/geoserver/rest/styles'));
  });

  it('create style payload is correct', function() {
    var payload = RESTService._createStylePayload('foo');
    assert.equal(payload, '<style><name>foo</name><filename>foo.sld</filename></style>');
  });

  it('getBaseUrl works ok with a vector layer as well', function() {
    var url = RESTService._getBaseUrl(vector);
    assert.equal(url.pathname, '/geoserver/rest');
  });

  it('getStyleName works ok with a vector layer as well', function() {
    var url = RESTService._getStyleNameUrl(vector);
    var urlObj = new URL(url);
    assert.equal(urlObj.pathname, '/geoserver/rest/layers/states.json');
  });

});
