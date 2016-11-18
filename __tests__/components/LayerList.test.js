/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');
require('phantomjs-polyfill-object-assign');

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
      id: 'osm',
      type: 'base',
      title: 'Streets',
      source: new ol.source.OSM()
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
    var items = container.querySelectorAll('.layer-list-item');
    assert.equal(items.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not generate a list item for our layer if filter', function() {
    var container = document.createElement('div');
    var filter = function(lyr) {
      return false;
    };
    ReactDOM.render((
      <LayerList filter={filter} intl={intl} map={map}/>
    ), container);
    var items = container.querySelectorAll('.layer-list-item');
    assert.equal(items.length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles group layers', function() {
    var group =  new ol.layer.Group({
      title: 'Overlays',
      layers: [
        new ol.layer.Group({
          title: 'Overlay 1',
          layers: [
            new ol.layer.Tile({
              title: 'States',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'usa:states'
                }
              })
            }),
            new ol.layer.Tile({
              title: 'Countries',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'opengeo:countries'
                }
              })
            }),
            new ol.layer.Tile({
              title: 'DEM',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'usgs:dem'
                }
              })
            })
          ]
        })
      ]
    });
    map.removeLayer(layer);
    map.addLayer(group);
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerList intl={intl} map={map}/>
    ), container);
    var checkboxes = container.querySelectorAll('input');
    var checkedCount = 0;
    var i, ii;
    for (i = 0, ii = checkboxes.length; i < ii; ++i) {
      if (checkboxes[i].checked) {
        checkedCount++;
      }
    }
    assert.equal(checkedCount, 5);
    group.getLayers().item(0).setVisible(false);
    checkedCount = 0;
    for (i = 0, ii = checkboxes.length; i < ii; ++i) {
      if (checkboxes[i].checked) {
        checkedCount++;
      }
    }
    assert.equal(checkedCount, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
