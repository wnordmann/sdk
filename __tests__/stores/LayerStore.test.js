/* global beforeEach, describe, it */

var assert = require('chai').assert;
var ol = require('openlayers');

var LayerStore = require('../../js/stores/LayerStore.js');

describe('LayerStore', function() {

  var target, map;
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
    map = new ol.Map({
      target: target,
      layers: [
        new ol.layer.Group({
          id: 'level1',
          layers: [
            new ol.layer.Group({
              id: 'level2',
              layers: [
                new ol.layer.Layer({id: 'level3'})
              ]
            })
          ]
        })
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

});
