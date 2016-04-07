/* global afterEach, beforeEach, describe, it */

var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var Bookmarks = require('../../js/components/Bookmarks.jsx');

describe('Bookmarks', function() {
  var target, map;
  var width = 360;
  var height = 180;
  var bookmarks = [{
    name: 'Le Grenier Pain',
    description: '<b>Address: </b>38 rue des Abbesses<br><b>Telephone:</b> 33 (0)1 46 06 41 81<br><a href=""http://www.legrenierapain.com"">Website</a>',
    extent: [259562.7661267497, 6254560.095662868, 260675.9610346824, 6256252.988234103]
  }, {
    name: 'Poilne',
    description: '<b>Address: </b>8 rue du Cherche-Midi<br><b>Telephone:</b> 33 (0)1 45 48 42 59<br><a href=""http://www.poilane.fr"">Website</a>',
    extent: [258703.71361629796, 6248811.5276565505, 259816.90852423065, 6250503.271278702]
  }];

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


  it('zooms to the next bookmark', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Bookmarks intl={intl} useCSS={false} map={map} bookmarks={bookmarks} />
    ), container);
    var button = container.querySelector('button.slick-next');
    var prev = container.querySelector('button.slick-prev');
    assert.equal(map.getView().getZoom(), 1);
    assert.equal(map.getView().getCenter()[0], 0);
    assert.equal(map.getView().getCenter()[1], 0);
    TestUtils.SimulateNative.click(button);
    assert.equal(map.getView().getZoom(), 14);
    assert.equal(map.getView().getCenter()[0], 260119.36358071605);
    assert.equal(map.getView().getCenter()[1], 6255406.541948485);
    TestUtils.SimulateNative.click(button);
    assert.equal(map.getView().getZoom(), 14);
    assert.equal(map.getView().getCenter()[0], 259260.31107026432);
    assert.equal(map.getView().getCenter()[1], 6249657.399467627);
    TestUtils.SimulateNative.click(prev);
    assert.equal(map.getView().getZoom(), 14);
    assert.equal(map.getView().getCenter()[0], 260119.36358071605);
    assert.equal(map.getView().getCenter()[1], 6255406.541948485);
    ReactDOM.unmountComponentAtNode(container);
  });

});
