/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');
var injectTapEventPlugin = require('react-tap-event-plugin');

injectTapEventPlugin();

var StyleModal = require('../../js/components/StyleModal.jsx');

describe('StyleModal', function() {
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
      new ol.layer.Vector({
        souce: new ol.source.Vector()
      })
    ];
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      layers: layers,
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


  it('sets the geometry type based on the layer', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    layers[0].set('wfsInfo', {
      attributes: ['foo', 'bar'],
      geometryType: 'MultiPolygon'
    });
    assert.equal(dialog.state.geometryType, 'Polygon');
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
