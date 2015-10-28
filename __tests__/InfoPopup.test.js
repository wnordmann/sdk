/* global afterEach, beforeEach, describe, it */

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('chai').assert;
var ol = require('openlayers');
global.Intl = require('intl');
var IntlProvider = require('react-intl').IntlProvider;

var InfoPopup = require('../js/components/InfoPopup.jsx');

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
    var app = React.render((
      <IntlProvider locale='en'>{() => (<InfoPopup ref='popup' map={map} />)}</IntlProvider>
    ), container);
    var popup = app.refs.popup.refs.wrappedElement;
    var callbackCalled = false;
    popup._fetchData({}, [], function() {
      callbackCalled = true;
    });
    assert.equal(callbackCalled, true);
    React.unmountComponentAtNode(container);
  });

});
