/* global beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var MapPanel = require('../../js/components/MapPanel.jsx');

describe('MapPanel', function() {
  var map, layer;

  beforeEach(function(done) {
    layer = new ol.layer.Vector({
      source: new ol.source.Vector({})
    });
    map = new ol.Map({
      layers: [layer],
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  it('sets the target for the map', function() {
    var container = document.createElement('div');
    assert.equal(map.getTarget() === undefined, true);
    ReactDOM.render((
      <MapPanel intl={intl} id='map' map={map} />
    ), container);
    assert.equal(map.getTarget() !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
