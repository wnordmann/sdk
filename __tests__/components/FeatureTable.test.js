/* global afterEach, beforeEach, describe, it */

var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');
require('phantomjs-polyfill-object-assign');

var FeatureTable = require('../../js/components/FeatureTable.jsx');

describe('FeatureTable', function() {
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
      id: 'mylayer',
      source: new ol.source.Vector({})
    });
    layer.getSource().addFeatures([
      new ol.Feature({foo: 'bar1', link: 'http://www.foo.com/bar1'}),
      new ol.Feature({foo: 'bar2', link: 'http://www.foo.com/bar2'}),
      new ol.Feature({foo: 'bar3', link: 'http://www.foo.com/bar3'}),
      new ol.Feature({foo: 'bar4', link: 'http://www.foo.com/bar4'})
    ]);
    document.body.appendChild(target);
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


  it('sets the correct row count', function() {
    var container = document.createElement('div');
    var table = ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    assert.equal(table.state.rowCount, 4);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('creates a link cell', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    var hyperlinks = container.querySelectorAll('a');
    assert.equal(hyperlinks.length, 4 + 2); // 4 cells and 2 column headers for sort
    assert.equal(hyperlinks[2].getAttribute('href'), 'http://www.foo.com/bar1');
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sorts table when clicking on a header', function() {
    var container = document.createElement('div');
    var table = ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    assert.equal(table.state.sortIndexes, undefined); // no sort
    var hyperlinks = container.querySelectorAll('a');
    var colSort1 = hyperlinks[0];
    TestUtils.SimulateNative.click(colSort1);
    assert.equal(table.state.sortIndexes[0], 0);
    assert.equal(table.state.sortIndexes[1], 1);
    assert.equal(table.state.sortIndexes[2], 2);
    assert.equal(table.state.sortIndexes[3], 3);
    TestUtils.SimulateNative.click(colSort1);
    assert.equal(table.state.sortIndexes[0], 3);
    assert.equal(table.state.sortIndexes[1], 2);
    assert.equal(table.state.sortIndexes[2], 1);
    assert.equal(table.state.sortIndexes[3], 0);
    ReactDOM.unmountComponentAtNode(container);
  });

});
