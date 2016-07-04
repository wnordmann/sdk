/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var QGISLegend = require('../../js/components/QGISLegend.jsx');

describe('QGISLegend', function() {
  var target, map, layer;
  var legendBasePath = './';
  var legendData = {
    'foo': [
        {
          'href': '0_0.png',
          'title': '?'
        }
    ]
  };
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
    document.body.appendChild(target);
    layer = new ol.layer.Tile({
      id: 'foo',
      source: new ol.source.OSM()
    });
    map = new ol.Map({
      target: target,
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

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('generates the correct legend url', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <QGISLegend intl={intl} legendBasePath={legendBasePath} legendData={legendData} map={map}/>
    ), container);
    var image = container.querySelector('img');
    assert.equal(image.getAttribute('src'), './0_0.png');
    ReactDOM.unmountComponentAtNode(container);
  });

});
