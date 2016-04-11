/* global afterEach, beforeEach, describe, it */

var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var HomeButton = require('../../js/components/HomeButton.jsx');

describe('HomeButton', function() {
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


  it('zooms to the correct location when home button is pressed', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <HomeButton intl={intl} map={map}/>
    ), container);
    var button = container.querySelector('button');
    map.getView().setZoom(5);
    map.getView().setCenter([100, 100]);
    assert.equal(map.getView().getZoom(), 5);
    assert.equal(map.getView().getCenter()[0], 100);
    TestUtils.SimulateNative.click(button);
    assert.equal(map.getView().getZoom(), 1);
    assert.equal(map.getView().getCenter()[0], 0);
    ReactDOM.unmountComponentAtNode(container);
  });

});
