/* global afterEach, beforeEach, describe, it */

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('chai').assert;
var ol = require('openlayers');
global.Intl = require('intl');
var IntlProvider = require('react-intl').IntlProvider;

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


  it('adds a select interaction to the map when active', function() {
    var container = document.createElement('div');
    React.render((
      <IntlProvider locale='en'>{() => (<HomeButton map={map} />)}</IntlProvider>
    ), container);
    var button = container.querySelector('button');
    map.getView().setZoom(5);
    map.getView().setCenter([100, 100]);
    assert.equal(map.getView().getZoom(), 5);
    assert.equal(map.getView().getCenter()[0], 100);
    TestUtils.SimulateNative.click(button);
    assert.equal(map.getView().getZoom(), 1);
    assert.equal(map.getView().getCenter()[0], 0);
    React.unmountComponentAtNode(container);
  });

});
