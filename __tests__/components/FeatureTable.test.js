/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var FeatureTable = require('../../js/components/FeatureTable.jsx');

describe('FeatureTable', function() {
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
    layer = new ol.layer.Vector({
      id: 'mylayer',
      source: new ol.source.Vector({})
    });
    layer.getSource().addFeatures([
      new ol.Feature({foo: 'bar1'}),
      new ol.Feature({foo: 'bar2'}),
      new ol.Feature({foo: 'bar3'})
    ]);
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


  it('zooms to the correct location when home button is pressed', function() {
    var container = document.createElement('div');
    var table = ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    assert.equal(table.state.rowCount, 3);
    ReactDOM.unmountComponentAtNode(container);
  });

});
