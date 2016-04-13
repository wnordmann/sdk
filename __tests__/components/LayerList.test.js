/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var LayerList = require('../../js/components/LayerList.jsx');

describe('LayerList', function() {
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
      id: 'mapquest',
      type: 'base',
      title: 'Satellite',
      source: new ol.source.MapQuest({layer: 'sat'})
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


  it('generates a list item for our layer', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerList intl={intl} map={map}/>
    ), container);
    var items = container.querySelectorAll('li');
    assert.equal(items.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
