/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var Legend = require('../../js/components/Legend.jsx');

describe('Legend', function() {
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
      new ol.layer.Tile({
        id: 'mapquest',
        title: 'MapQuest',
        source: new ol.source.MapQuest({
          layer: 'sat'
        })
      }),
      new ol.layer.Tile({
        id: 'wms',
        title: 'WMS',
        visible: false,
        source: new ol.source.TileWMS({
          url: '/geoserver/wms',
          params: {
            LAYERS: 'foo'
          }
        })
      })
    ];
    document.body.appendChild(target);
    map = new ol.Map({
      layers: layers,
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


  it('no legend img if no WMS layer visible', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Legend intl={intl} map={map}/>
    ), container);
    var items = container.querySelectorAll('.legend-list-img');
    assert.equal(items.length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('legend img if WMS layer visible', function() {
    layers[1].setVisible(true);
    var container = document.createElement('div');
    ReactDOM.render((
      <Legend intl={intl} map={map}/>
    ), container);
    var items = container.querySelectorAll('.legend-list-img');
    assert.equal(items.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
