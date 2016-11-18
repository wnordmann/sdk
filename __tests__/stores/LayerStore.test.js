/* global beforeEach, afterEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var LayerStore = require('../../js/stores/LayerStore.js');
var LayerActions = require('../../js/actions/LayerActions.js');

describe('LayerStore', function() {

  var target, map, level1, level2, level3, level3a;
  var width = 360;
  var height = 180;

  beforeEach(function() {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);

    level3 = new ol.layer.Layer({id: 'level3'});
    level3a = new ol.layer.Layer({id: 'level3a'});
    level2 = new ol.layer.Group({
      id: 'level2',
      layers: [
        level3,
        level3a
      ]
    });
    level1 = new ol.layer.Group({
      id: 'level1',
      layers: [
        level2
      ]
    });
    map = new ol.Map({
      target: target,
      layers: [
        level1
      ],
      view: new ol.View({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });

  it('finds a layer in a group', function() {
    LayerStore.bindMap(map);
    var layer = LayerStore.findLayer('level3');
    assert.equal(layer !== undefined, true);
    layer = LayerStore.findLayer('level2');
    assert.equal(layer !== undefined, true);
    layer = LayerStore.findLayer('level4');
    assert.equal(layer !== undefined, false);
  });

  it('fires change when layer gets added / removed on the map', function() {
    LayerStore.bindMap(map);
    var count = 0;
    var onChangeCb = function() {
      count++;
    };
    LayerStore.addChangeListener(onChangeCb);
    assert.equal(LayerStore.getState().flatLayers.length, 2);
    map.addLayer(new ol.layer.Vector());
    assert.equal(LayerStore.getState().flatLayers.length, 3);
    assert.equal(count, 1);
    map.getLayers().pop();
    assert.equal(count, 2);
    assert.equal(LayerStore.getState().flatLayers.length, 2);
  });

  it('listens to the app dispatcher', function() {
    LayerStore.bindMap(map);
    var vector = new ol.layer.Vector({id: '1'});
    map.addLayer(vector);
    assert.equal(LayerStore.findLayer('1'), vector);
    LayerActions.removeLayer(vector);
    assert.equal(LayerStore.findLayer('1'), undefined);
  });

  it('handles layer order changes', function() {
    LayerStore.bindMap(map);
    var count = 0;
    var onChangeCb = function() {
      count++;
    };
    LayerStore.addChangeListener(onChangeCb);
    var idx = level2.getLayers().getArray().indexOf(level3a);
    assert.equal(idx, 1);
    LayerActions.moveLayer(1, 0, level3a, level2);
    assert.equal(count, 2);
    idx = level2.getLayers().getArray().indexOf(level3a);
    assert.equal(idx, 0);
  });

});
