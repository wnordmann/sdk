/* global describe, it, beforeEach, afterEach */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import ArcGISRestService from '../../js/services/ArcGISRestService';

raf.polyfill();

describe('ArcGISRestService', function() {

  var target, map, layer;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    layer = new ol.layer.Tile({
      id: '0',
      source: new ol.source.TileArcGISRest({
        url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer',
        params: {
          LAYERS: '0'
        }
      })
    });
    document.body.appendChild(target);
    map = new ol.Map({
      layers: [layer],
      target: target,
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });

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

  it('creates correct GetFeatureInfo url', function() {
    var url = ArcGISRestService.getFeatureInfoUrl(layer, [-12355128.377959318, 4862617.991389772], map);
    assert.equal(url, 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/identify?geometryType=esriGeometryPoint&geometry=-12355128.377959318%2C4862617.991389772&sr=3857&layers=undefined&tolerance=2&mapExtent=-14088873.053523688%2C-7044436.526761844%2C14088873.053523688%2C7044436.526761844&imageDisplay=360%2C180%2C90&f=json&callback=__cbname__&pretty=false');
  });

  it('parses GetFeatureInfo response correctly', function() {
    var jsonData = JSON.parse('{"results":[{"layerId":0,"layerName":"CEISEN Population","value":"2281.951660","displayFieldName":"","attributes":{"Stretched value":"108","Pixel value":"2281.951660"},"geometryType":"esriGeometryPoint","geometry":{"x":-9368733.68285748,"y":4304933.43302113,"spatialReference":{"wkid":102100}}}]}');
    var response = ArcGISRestService.parseGetFeatureInfo(layer, jsonData);
    assert.equal(response.layer.get('id'), layer.get('id'));
    assert.equal(response.features.length, 1);
    assert.equal(response.features[0].get('Stretched value'), '108');
  });

  it('creates correct legend url', function() {
    var url = ArcGISRestService.getLegendUrl('http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer');
    assert.equal(url, 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/legend?f=json&pretty=false&callback=__cbname__');
  });

  it('creates correct get feature url', function() {
    var url = ArcGISRestService.getLoadFeaturesUrl(layer, 0, 20, [{id: 'FOO', asc: false}], 'EPSG:3857');
    assert.equal(url, 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/undefined/query?where=OBJECTID%20%3E%3D%200%20AND%20OBJECTID%20%3C%2020&f=json&callback=__cbname__&pretty=false&outSR=3857&orderByFields=FOO%20DESC');
  });

  it('creates correct number of features url', function() {
    var url = ArcGISRestService.getNumberOfFeaturesUrl(layer);
    assert.equal(url, 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/undefined/query?where=1%3D1&f=json&callback=__cbname__&pretty=false&returnCountOnly=true');
  });

});
