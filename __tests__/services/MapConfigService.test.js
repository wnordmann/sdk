/* global describe, it, beforeEach, afterEach */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var MapConfigService = require('../../js/services/MapConfigService.js');

describe('MapConfigService', function() {

  var target, map, layers;
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
    layers = [
      new ol.layer.Tile({
        title: 'OSM',
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        title: 'Vector',
        source: new ol.source.Vector({
          url: 'foo.json',
          format: new ol.format.GeoJSON()
        })
      })
    ];
    document.body.appendChild(target);
    map = new ol.Map({
      layers: layers,
      target: target,
      view: new ol.View({
        center: [500, 500],
        resolution: 10
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

  it('returns the correct source config for Vector and Cluster', function() {
    var source = new ol.source.Vector({
      url: '/test.json',
      format: new ol.format.GeoJSON()
    });
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'Vector');
    assert.equal(config.properties.url, '/test.json');
    assert.equal(config.properties.format.type, 'GeoJSON');
    var cluster = new ol.source.Cluster({
      source: source
    });
    config = MapConfigService.getSourceConfig(cluster);
    assert.equal(config.type, 'Cluster');
    assert.equal(config.source.type, 'Vector');
  });

  it('returns the correct source config for ImageWMS', function() {
    var source = new ol.source.ImageWMS({
      url: '/geoserver/wms',
      params: {
        LAYERS: 'foo'
      }
    });
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'ImageWMS');
    assert.equal(config.properties.params.LAYERS, 'foo');
    assert.equal(config.properties.url, '/geoserver/wms');
  });

  it('returns the correct source config for OSM', function() {
    var source = new ol.source.OSM();
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'OSM');
  });

  it('returns the correct source config for XYZ', function() {
    var source = new ol.source.XYZ({url: 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'});
    var config = MapConfigService.getSourceConfig(source);
    assert.equal(config.type, 'XYZ');
    assert.equal(config.properties.urls.length, 1);
    assert.equal(config.properties.urls[0], 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png');
  });

  it('uses attribution', function() {
    var source = new ol.source.XYZ({
      url: 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attributions: [
        new ol.Attribution({
          html: 'foo'
        })
      ]
    });
    var config = MapConfigService.getSourceConfig(source);
    assert(config.properties.attributions.length, 1);
    assert(config.properties.attributions[0], 'foo');
  });

  it('returns the correct layer config for vector / cluster layer (and vice versa)', function() {
    var layer = new ol.layer.Vector({
      source: new ol.source.Cluster({
        source: new ol.source.Vector({
          url: 'foo.json',
          format: new ol.format.GeoJSON()
        })
      })
    });
    var config = {};
    config = MapConfigService.getLayerConfig(config, layer);
    assert.equal(config.type, 'Vector');
    var result = MapConfigService.generateLayerFromConfig(config);
    assert.equal(result instanceof ol.layer.Vector, true);
    assert.equal(result.getSource() instanceof ol.source.Cluster, true);
    assert.equal(result.getSource().getSource() instanceof ol.source.Vector, true);
    assert.equal(result.getSource().getSource().getUrl(), 'foo.json');
    assert.equal(result.getSource().getSource().getFormat() instanceof ol.format.GeoJSON, true);
  });

  it('returns the correct layer config for tiled layer (and vice versa)', function() {
    var layer = new ol.layer.Tile({
      visible: false,
      title: 'My Layer',
      source: new ol.source.OSM()
    });
    var config = {};
    config = MapConfigService.getLayerConfig(config, layer);
    assert.equal(config.type, 'Tile');
    assert.equal(config.properties.visible, false);
    assert.equal(config.properties.title, 'My Layer');
    var result = MapConfigService.generateLayerFromConfig(config);
    assert.equal(result instanceof ol.layer.Tile, true);
    assert.equal(result.get('title'), 'My Layer');
    assert.equal(result.getVisible(), false);
    assert.equal(result.getSource() instanceof ol.source.OSM, true);
  });

  it('creates and serializes TMS source correctly', function() {
    var config = {'type':'TMS','properties':{'format':'png','urls':['http://a.tiles.mapbox.com/v1/mapbox.geography-class/','http://b.tiles.mapbox.com/v1/mapbox.geography-class/','http://c.tiles.mapbox.com/v1/mapbox.geography-class/','http://d.tiles.mapbox.com/v1/mapbox.geography-class/'],'maxZoom':8}};
    var source = MapConfigService.generateSourceFromConfig(config);
    assert.equal(source instanceof ol.source.XYZ, true);
    assert.equal(source.get('originalType'), 'TMS');
    assert.equal(source.get('originalProperties').urls[0], 'http://a.tiles.mapbox.com/v1/mapbox.geography-class/');
    var json = MapConfigService.getSourceConfig(source);
    var expected = {'type':'TMS','properties':{'format':'png','maxZoom':8,'wrapX':false,'urls':['http://a.tiles.mapbox.com/v1/mapbox.geography-class/','http://b.tiles.mapbox.com/v1/mapbox.geography-class/','http://c.tiles.mapbox.com/v1/mapbox.geography-class/','http://d.tiles.mapbox.com/v1/mapbox.geography-class/']}};
    assert.equal(JSON.stringify(json), JSON.stringify(expected));
  });

  it('creates and serializes TileArcGISRest source properly', function() {
    var config = {'type':'TileArcGISRest','properties':{'urls':['http://cga6.cga.harvard.edu/arcgis/rest/services/darmc/roman/MapServer'],'params':{'LAYERS':'show:0','FORMAT':'png'}}};
    var source = MapConfigService.generateSourceFromConfig(config);
    assert.equal(source instanceof ol.source.TileArcGISRest, true);
    assert.equal(source.getUrls()[0], 'http://cga6.cga.harvard.edu/arcgis/rest/services/darmc/roman/MapServer');
    assert.equal(source.getParams().LAYERS, 'show:0');
    assert.equal(source.getParams().FORMAT, 'png');
    var json = MapConfigService.getSourceConfig(source);
    var expected = {'type':'TileArcGISRest','properties':{'urls':['http://cga6.cga.harvard.edu/arcgis/rest/services/darmc/roman/MapServer'],'params':{'LAYERS':'show:0','FORMAT':'png'}}};
    assert.equal(JSON.stringify(json), JSON.stringify(expected));
  });

  it('creates and serializes BingMaps source properly', function() {
    var config = {'type':'BingMaps','properties':{'key': 'foo','imagerySet': 'AerialWithLabels'}};
    var source = MapConfigService.generateSourceFromConfig(config);
    assert.equal(source instanceof ol.source.BingMaps, true);
    assert.equal(source.getApiKey(), 'foo');
    assert.equal(source.getImagerySet(), 'AerialWithLabels');
    var json = MapConfigService.getSourceConfig(source);
    var expected = {'type':'BingMaps','properties':{'key':'foo','imagerySet':'AerialWithLabels'}};
    assert.equal(JSON.stringify(json), JSON.stringify(expected));
  });

  it('returns the correct layer config for group layer (and vice versa)', function() {
    var layer = new ol.layer.Group({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
          wfsInfo: true,
          source: new ol.source.TileWMS()
        })
      ]
    });
    var config = {};
    config = MapConfigService.getLayerConfig(config, layer);
    assert.equal(config.type, 'Group');
    assert.equal(config.children[0].type, 'Tile');
    assert.equal(config.children[0].source.type, 'OSM');
    assert.equal(config.children[1].type, 'Tile');
    var result = MapConfigService.generateLayerFromConfig(config);
    assert.equal(result instanceof ol.layer.Group, true);
    assert.equal(result.getLayers().item(0) instanceof ol.layer.Tile, true);
    assert.equal(result.getLayers().item(0).getSource() instanceof ol.source.OSM, true);
    assert.equal(result.getLayers().item(1) instanceof ol.layer.Tile, true);
    assert.equal(result.getLayers().item(1).getSource() instanceof ol.source.TileWMS, true);
  });

  it('performs save correctly', function() {
    var config = MapConfigService.save(map);
    assert.equal(config.view.center[0], 500);
    assert.equal(config.view.resolution, 10);
    assert.equal(config.view.rotation, 0);
  });

  it('perform load correctly', function() {
    var config = {
      view: {
        center: [0, 0],
        resolution: 200
      },
      layers: [{
        type: 'Tile',
        source: {
          type: 'OSM'
        }
      }]
    };
    assert.equal(map.getLayers().getLength(), 2);
    MapConfigService.load(config, map);
    assert.equal(map.getLayers().getLength(), 1);
    assert.equal(map.getLayers().item(0) instanceof ol.layer.Tile, true);
    assert.equal(map.getLayers().item(0).getSource() instanceof ol.source.OSM, true);
    assert.equal(map.getView().getResolution(), 200);
    assert.equal(map.getView().getCenter()[0], 0);
    assert.equal(map.getView().getCenter()[1], 0);
  });

});
