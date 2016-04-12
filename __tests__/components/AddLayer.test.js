/* global afterEach, beforeEach, describe, it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var AddLayer = require('../../js/components/AddLayer.jsx');

describe('AddLayer', function() {
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
      id: 'foo',
      isWFST: true,
      title: 'My Layer',
      source: new ol.source.MapQuest({layer: 'sat'})
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


  it('generates the correct layer selector', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <AddLayer intl={intl} map={map}/>
    ), container);
    var button = container.querySelector('button');
    TestUtils.SimulateNative.click(button);
    var dropzones = document.querySelectorAll('div.dropzone');
    assert.equal(dropzones.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
