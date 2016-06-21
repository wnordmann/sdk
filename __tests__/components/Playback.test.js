/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var Playback = require('../../js/components/Playback.jsx');

describe('Playback', function() {
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
      <Playback minDate={500000000000} maxDate={1500000000000} intl={intl} map={map}/>
    ), container);
    assert.equal(container.querySelector('input[type=text]').value, '11/5/1985');
    ReactDOM.unmountComponentAtNode(container);
  });

});
