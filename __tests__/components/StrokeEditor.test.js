/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');
var raf = require('raf');
raf.polyfill();
require('phantomjs-polyfill-object-assign');

var StrokeEditor = require('../../js/components/StrokeEditor.jsx');

describe('StrokeEditor', function() {

  it('generates the correct color', function() {
    var container = document.createElement('div');
    var initialState = {strokeWidth: 2, strokeColor: {rgb: {r: 0, g: 255, b: 0, a: 0.5}, hex: '00FF00'}};
    var onChange = function(state) {
      assert.equal(state.strokeColor.hex, initialState.strokeColor.hex);
      assert.equal(state.strokeColor.rgb.r, initialState.strokeColor.rgb.r);
      assert.equal(state.strokeColor.rgb.g, initialState.strokeColor.rgb.g);
      assert.equal(state.strokeColor.rgb.b, initialState.strokeColor.rgb.b);
      assert.equal(state.strokeColor.rgb.a, initialState.strokeColor.rgb.a);
      assert.equal(state.strokeWidth, initialState.strokeWidth);
    };
    ReactDOM.render((
      <StrokeEditor intl={intl} onChange={onChange} initialState={initialState} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

});
