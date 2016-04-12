/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();

var FillEditor = require('../../js/components/FillEditor.jsx');

describe('FillEditor', function() {

  it('generates the correct color', function() {
    var container = document.createElement('div');
    var initialState = {fillColor: {rgb: {r: 0, g: 255, b: 0, a: 0.5}, hex: '00FF00'}};
    var onChange = function(state) {
      assert.equal(state.fillColor.hex, initialState.fillColor.hex);
      assert.equal(state.fillColor.rgb.r, initialState.fillColor.rgb.r);
      assert.equal(state.fillColor.rgb.g, initialState.fillColor.rgb.g);
      assert.equal(state.fillColor.rgb.b, initialState.fillColor.rgb.b);
      assert.equal(state.fillColor.rgb.a, initialState.fillColor.rgb.a);
    };
    ReactDOM.render((
      <FillEditor onChange={onChange} initialState={initialState} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

});
