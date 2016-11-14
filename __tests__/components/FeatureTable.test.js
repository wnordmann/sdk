/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
require('phantomjs-polyfill-find');
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


  it('creates a link cell', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    var hyperlinks = container.querySelectorAll('a');
    assert.equal(hyperlinks.length, 4);
    assert.equal(hyperlinks[2].getAttribute('href'), 'http://www.foo.com/bar3');
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders table cells correctly', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <FeatureTable layer={layer} intl={intl} map={map}/>
    ), container);
    var tds = container.querySelectorAll('td');
    assert.equal(tds[1].firstChild.innerHTML, 'bar1');
    assert.equal(tds[4].firstChild.innerHTML, 'bar2');
    assert.equal(tds[7].firstChild.innerHTML, 'bar3');
    assert.equal(tds[10].firstChild.innerHTML, 'bar4');
    ReactDOM.unmountComponentAtNode(container);
  });

});
