/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var LoadingPanel = require('../../js/components/LoadingPanel.jsx');

describe('LoadingPanel', function() {
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
    document.body.appendChild(target);
    layer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: '/geoserver/wms',
        params: {
          LAYERS: 'foo'
        }
      })
    });
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


  it('shows wehn tileloadstart is fired', function() {
    var container = document.createElement('div');
    var lp = ReactDOM.render((
      <LoadingPanel map={map}/>
    ), container);
    layer.getSource().dispatchEvent('tileloadstart');
    assert.equal(lp.state.show, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
