/* global beforeEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var FeatureStore = require('../../js/stores/FeatureStore.js');
var SelectActions = require('../../js/actions/SelectActions.js');

describe('FeatureStore', function() {

  var map, layer, features;
  beforeEach(function() {
    map = new ol.Map({view: new ol.View()});
    layer = new ol.layer.Vector({id: Date.now(), source: new ol.source.Vector()});
    features = [
      new ol.Feature({'foo': '1'}),
      new ol.Feature({'foo': '2'}),
      new ol.Feature({'foo': '3'}),
      new ol.Feature({'foo': '4'}),
      new ol.Feature({'foo': '5'})
    ];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      layer.getSource().addFeature(features[i]);
    }
    map.addLayer(layer);
    FeatureStore.bindMap(map);
  });

  it('adds the correct config to the FeatureStore using addLayer', function() {
    FeatureStore.addLayer(layer);
    var config = FeatureStore._config[layer.get('id')];
    assert.equal(config.selected.length, 0);
    assert.equal(config.features.length, 5);
    assert.equal(config.originalFeatures.length, 5);
  });

  it('handles setSelection correctly', function() {
    FeatureStore.addLayer(layer);
    var config = FeatureStore._config[layer.get('id')];
    FeatureStore.setSelection(layer, [features[1], features[2]]);
    assert.equal(config.selected.length, 2);
    assert.equal(config.selected[0].get('foo'), '2');
    assert.equal(config.selected[1].get('foo'), '3');
    FeatureStore.setSelection(layer, [features[4]]);
    assert.equal(config.selected.length, 3);
    assert.equal(config.selected[2].get('foo'), '5');
    FeatureStore.setSelection(layer, [features[4]], true);
    assert.equal(config.selected.length, 1);
    assert.equal(config.selected[0].get('foo'), '5');
    FeatureStore.setSelectedAsFilter(layer);
    assert.equal(config.features.length, 1);
    assert.equal(config.features[0].get('foo'), '5');
    FeatureStore.setSelection(layer, [features[0], features[1]], true);
    assert.equal(config.features.length, 2);
    assert.equal(config.features[0].get('foo'), '1');
    FeatureStore.restoreOriginalFeatures(layer);
    assert.equal(config.features.length, 5);
  });

  it('listens to app dispatcher', function() {
    FeatureStore.addLayer(layer);
    var config = FeatureStore._config[layer.get('id')];
    assert.equal(config.selected.length, 0);
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[0]);
    assert.equal(config.selected.length, 1);
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[0]);
    assert.equal(config.selected.length, 0);
    SelectActions.selectFeatures(layer, layer.getSource().getFeatures());
    assert.equal(config.selected.length, 5);
    SelectActions.selectFeatures(layer, [layer.getSource().getFeatures()[0]], true);
    assert.equal(config.selected.length, 1);
    SelectActions.clear(layer);
    assert.equal(config.selected.length, 0);
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[0]);
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[1]);
    assert.equal(config.selected.length, 2);
  });

  it('selectFeaturesInCurrentSelection works correctly', function() {
    FeatureStore.addLayer(layer);
    var config = FeatureStore._config[layer.get('id')];
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[0]);
    SelectActions.toggleFeature(layer, layer.getSource().getFeatures()[1]);
    FeatureStore.selectFeaturesInCurrentSelection(layer, [layer.getSource().getFeatures()[3]]);
    assert.equal(config.selected.length, 0);
  });

  it('listens for change on the source', function() {
    FeatureStore.addLayer(layer);
    var config = FeatureStore._config[layer.get('id')];
    assert.equal(config.features.length, 5);
    assert.equal(config.originalFeatures.length, 5);
    layer.getSource().addFeature(new ol.Feature({'foo': '6'}));
    assert.equal(config.features.length, 6);
    assert.equal(config.originalFeatures.length, 6);
  });

});
