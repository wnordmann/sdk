/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
require('phantomjs-polyfill-object-assign');
var injectTapEventPlugin = require('react-tap-event-plugin');

injectTapEventPlugin();

var EditForm = require('../../js/components/EditForm.jsx');

describe('EditForm', function() {

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

  it('generates the correct inputs', function() {
    var container = document.createElement('div');
    var feature = new ol.Feature({foo: 'bar'});
    var layer = new ol.layer.Vector({
      wfsInfo: {
        attributes: ['foo']
      },
      source: new ol.source.Vector({})
    });
    ReactDOM.render((
      <EditForm map={map} intl={intl} feature={feature} layer={layer} />
    ), container);
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs[0].id, 'foo');
    assert.equal(inputs[0].value, 'bar');
    ReactDOM.unmountComponentAtNode(container);
  });

});
