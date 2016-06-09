/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var assert = require('chai').assert;
var injectTapEventPlugin = require('react-tap-event-plugin');
var intl = require('../mock-i18n.js');

var Navigation = require('../../js/components/Navigation.jsx');

injectTapEventPlugin();

var tapDataInjector = function(x, y) {
  return {
    touches: [{
      pageX: x,
      pageY: y,
      clientX: x,
      clientY: y
    }]
  };
};

describe('Navigation', function() {

  it('click triggers the secondary state', function() {
    var container = document.createElement('div');
    var nav = ReactDOM.render((
      <Navigation toggleGroup='navigation' intl={intl} />
    ), container);
    var button = container.querySelector('button');
    assert.equal(nav.state.secondary, false);
    TestUtils.SimulateNative.touchStart(button, tapDataInjector(0, 0));
    TestUtils.SimulateNative.touchEnd(button, tapDataInjector(0, 0));
    assert.equal(nav.state.secondary, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
