/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var LegendItem = require('../../js/components/LegendItem.jsx');

describe('LegendItem', function() {
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


  it('no legend image if WMS layer is not visible', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LegendItem layer={layers[1]} />
    ), container);
    var image = container.querySelector('img');
    assert.equal(image, undefined);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('legend image if WMS layer is visible', function() {
    layers[1].setVisible(true);
    var container = document.createElement('div');
    ReactDOM.render((
      <LegendItem layer={layers[1]} />
    ), container);
    var image = container.querySelector('img');
    assert.equal(image !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
