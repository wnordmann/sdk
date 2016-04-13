/* global afterEach, beforeEach, describe, it */

var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var Geolocation = require('../../js/components/Geolocation.jsx');

describe('Geolocation', function() {
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


  it('has 2 features in the feature overlay after geolocation', function() {
    var container = document.createElement('div');
    var geolocation = ReactDOM.render((
      <Geolocation intl={intl} map={map}/>
    ), container);
    var button = container.querySelector('button');
    TestUtils.SimulateNative.click(button);
    assert.equal(geolocation._featuresOverlay.getSource().getFeatures().length, 2);
    ReactDOM.unmountComponentAtNode(container);
  });

});
