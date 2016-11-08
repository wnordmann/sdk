/* global describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var ArcGISRestService = require('../../js/services/ArcGISRestService.js');

describe('ArcGISRestService', function() {

  it('parses capabilities correctly', function() {
    var json = {'currentVersion':10.4,'serviceDescription':'DARMC (Atlas of Roman and Medieval Civilization)','mapName':'Layers','description':'','copyrightText':'','supportsDynamicLayers':false,'layers':[{'id':0,'name':'Roman and Medieval Civilization','parentLayerId':-1,'defaultVisibility':false,'subLayerIds':[1,13,28,29],'minScale':0,'maxScale':0},{'id':1,'name':'Coin Deposits','parentLayerId':0,'defaultVisibility':false,'subLayerIds':[2,3,7,12],'minScale':0,'maxScale':0},{'id':2,'name':'Gaul: hoards 200-300 AD','parentLayerId':1,'defaultVisibility':false,'subLayerIds':null,'minScale':0,'maxScale':0},{'id':3,'name':'Precious Metal Deposits 200-700 AD','parentLayerId':1,'defaultVisibility':false,'subLayerIds':[4,5,6],'minScale':0,'maxScale':0}]};
    var result = ArcGISRestService.parseCapabilities(json);
    assert.equal(result.Layer[0].Name, 0);
    assert.equal(result.Layer[0].Title, 'Roman and Medieval Civilization');
    assert.equal(result.Title, 'DARMC (Atlas of Roman and Medieval Civilization)');
  });

  it('generates the correct capabilities url', function() {
    var url = ArcGISRestService.getCapabilitiesUrl('http://cga6.cga.harvard.edu/arcgis/rest/services/darmc/roman/MapServer?');
    assert.equal(url, 'http://cga6.cga.harvard.edu/arcgis/rest/services/darmc/roman/MapServer?f=json&pretty=false&callback=__cbname__');
  });

  it('creates a layer correctly', function() {
    var layer = {
      Name: 'foo'
    };
    var url = 'http://host';
    var titleObj = {
      title: 'Foo layer',
      empty: false
    };
    var lyr = ArcGISRestService.createLayer(layer, url, titleObj);
    assert.equal(lyr.get('title'), titleObj.title);
    assert.equal(lyr.get('name'), layer.Name);
    var source = lyr.getSource();
    assert.equal(source instanceof ol.source.TileArcGISRest, true);
    assert.equal(source.getParams().LAYERS, layer.Name);
  });

});
