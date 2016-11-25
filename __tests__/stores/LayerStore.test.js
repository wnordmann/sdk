/* global beforeEach, afterEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import LayerStore from '../../js/stores/LayerStore';
import LayerActions from '../../js/actions/LayerActions';

raf.polyfill();

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

  it('removes layers from a group', function() {
    LayerStore.bindMap(map);
    // test remove layer from subgroup
    var length = level2.getLayers().getLength();
    assert.equal(length, 2);
    LayerActions.removeLayer(level3a, level2);
    length = level2.getLayers().getLength();
    assert.equal(length, 1);
    // test remove subgroup
    length = level1.getLayers().getLength();
    assert.equal(length, 1);
    LayerActions.removeLayer(level2, level1);
    length = level1.getLayers().getLength();
    assert.equal(length, 0);
    // test remove group
    length = map.getLayers().getLength();
    assert.equal(length, 1);
    LayerActions.removeLayer(level1);
    length = map.getLayers().getLength();
    assert.equal(length, 0);
  });

});
