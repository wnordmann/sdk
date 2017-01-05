/* global beforeEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import RESTService from '../../js/services/RESTService';

raf.polyfill();

describe('RESTService', function() {

  var layer, url;
  beforeEach(function() {
    layer = new ol.layer.Tile({
      name: 'states'
    });
    url = 'http://demo.boundlessgeo.com/geoserver/wms';
  });

  it('creates the correct url for get style name', function() {
    var styleUrl = RESTService._getStyleNameUrl(url, layer);
    var expected = 'http://demo.boundlessgeo.com/geoserver/rest/layers/states.json';
    assert.equal(styleUrl, expected);
    var proxy = 'http://proxy/?url=';
    styleUrl = RESTService._getStyleNameUrl(url, layer, proxy);
    assert.equal(styleUrl, proxy + encodeURIComponent(expected));
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
    var updateUrl = RESTService._getUpdateStyleUrl(url, layer);
    assert.equal(updateUrl, 'http://demo.boundlessgeo.com/geoserver/rest/styles/states');
    layer.set('styleName', 'foo:states');
    updateUrl = RESTService._getUpdateStyleUrl(url, layer);
    var expected = 'http://demo.boundlessgeo.com/geoserver/rest/workspaces/foo/styles/states';
    assert.equal(updateUrl, expected);
    var proxy = 'http://proxy/?url=';
    updateUrl = RESTService._getUpdateStyleUrl(url, layer, proxy);
    assert.equal(updateUrl, proxy + encodeURIComponent(expected));
  });

  it('create style payload is correct', function() {
    var payload = RESTService._createStylePayload('foo');
    assert.equal(payload, '<style><name>foo</name><filename>foo.sld</filename></style>');
  });

});
