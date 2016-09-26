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

var LayerSelector = require('../../js/components/LayerSelector.jsx');

describe('LayerSelect', function() {
  var target, map;
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
    map = new ol.Map({
      target: target,
      layers: [
        new ol.layer.Group({
          id: 'level1',
          layers: [
            new ol.layer.Vector({
              id: 'xyz',
              title: 'xyz'
            }),
            new ol.layer.Group({
              id: 'level2',
              layers: [
                new ol.layer.Vector({id: 'level3', title: 'level3'})
              ]
            })
          ]
        })
      ],
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


  it('correct number of entries in select', function() {
    var container = document.createElement('div');
    var filter = function(lyr) {
      return !lyr.get('hideFromLayerList') && lyr instanceof ol.layer.Vector;
    };
    var onChange = function(layer) {};
    var selector = ReactDOM.render(<LayerSelector intl={intl} onChange={onChange} filter={filter} map={map} />, container);
    assert.equal(selector.state.layers.length, 2);
    ReactDOM.unmountComponentAtNode(container);
  });

});
