/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var InfoPopup = require('../../js/components/InfoPopup.jsx');

describe('InfoPopup', function() {
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


  it('callback gets called even if no XHR is performed', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var callbackCalled = false;
    popup._fetchData({}, [], function() {
      callbackCalled = true;
    });
    assert.equal(callbackCalled, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
