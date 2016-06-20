/* global afterEach, beforeEach, describe, it */

var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var ImageExport = require('../../js/components/ImageExport.jsx');

var tapDataInjector = function(x, y) {
  return {
    touches: [{
      pageX: x,
      pageY: y,
      clientX: x,
      clientY: y
    }]
  };
};

describe('ImageExport', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    global.MouseEvent = global.Event;
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
    delete global.MouseEvent;
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('calls render sync on the map when pressed', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <ImageExport intl={intl} map={map}/>
    ), container);
    var button = container.querySelector('button');
    var called = false;
    map.once('postcompose', function(evt) {
      called = true;
    });
    TestUtils.SimulateNative.touchStart(button, tapDataInjector(0, 0));
    TestUtils.SimulateNative.touchEnd(button, tapDataInjector(0, 0));
    assert.equal(called, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
