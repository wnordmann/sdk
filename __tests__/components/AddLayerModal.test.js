/* global beforeEach, afterEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var AddLayerModal = require('../../js/components/AddLayerModal.jsx');

describe('AddLayerModal', function() {

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

  it('generates the correct GetCapabilities url', function(done) {
    var container = document.createElement('div');
    var url = 'http://localhost:8080/geoserver/wms';
    var modal = ReactDOM.render((
      <AddLayerModal map={map} allowUserInput={true} url={url} intl={intl} />
    ), container);
    var caps = modal._getCapabilitiesUrl(url);
    assert.equal(caps, url + '?service=WMS&request=GetCapabilities&version=1.3.0');
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
