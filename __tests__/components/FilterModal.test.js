/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');
require('phantomjs-polyfill-object-assign');

var FilterModal = require('../../js/components/FilterModal.jsx');

describe('FilterModal', function() {
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
    layer = new ol.layer.Vector({
      source: new ol.source.Vector({})
    });
    document.body.appendChild(target);
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


  it('sets the style function on the layer when a filter is added', function(done) {
    var container = document.createElement('div');
    var filter = ReactDOM.render((
      <FilterModal layer={layer} intl={intl} />
    ), container);
    filter.open();
    filter._addFilter();
    assert.equal(filter._styleSet, true);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
