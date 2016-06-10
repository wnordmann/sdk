/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var LayerListItem = require('../../js/components/LayerListItem.jsx');

describe('LayerListItem', function() {
  var target, map, layer, overlay;
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
      id: 'mapquest',
      type: 'base',
      title: 'Satellite',
      source: new ol.source.MapQuest({layer: 'sat'})
    });
    overlay = new ol.layer.Vector({
      id: 'vector',
      title: 'Earthquakes',
      source: new ol.source.Vector({})
    });
    document.body.appendChild(target);
    map = new ol.Map({
      layers: [layer, overlay],
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


  it('generates a list item for our layer but no zoom in for base layer', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerListItem intl={intl} title={layer.get('title')} map={map} layer={layer} />
    ), container);
    var zoomIn = container.querySelector('.layer-list-item-zoom');
    assert.equal(zoomIn, undefined);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('generates a list item for our layer with zoom in for overlay', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerListItem intl={intl} title={overlay.get('title')} map={map} layer={overlay} />
    ), container);
    var zoomIn = container.querySelector('layer-list-item-zoom');
    assert.equal(zoomIn !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
