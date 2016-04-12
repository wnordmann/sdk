/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var intl = require('../mock-i18n.js');

var LabelEditor = require('../../js/components/LabelEditor.jsx');

describe('LabelEditor', function() {

  it('generates the correct color', function() {
    var container = document.createElement('div');
    var initialState = {
      labelAttribute: 'foo',
      fontSize: 14,
      fontColor: {rgb: {r: 255, g: 0, b: 0, a: 1}, hex: 'FF0000'}
    };
    var attributes = ['foo', 'bar'];
    var onChange = function(state) {
      assert.equal(state.fontColor.hex, initialState.fontColor.hex);
      assert.equal(state.fontColor.rgb.r, initialState.fontColor.rgb.r);
      assert.equal(state.fontColor.rgb.g, initialState.fontColor.rgb.g);
      assert.equal(state.fontColor.rgb.b, initialState.fontColor.rgb.b);
      assert.equal(state.fontColor.rgb.a, initialState.fontColor.rgb.a);
      assert.equal(state.fontSize, initialState.fontSize);
      assert.equal(state.labelAttribute, initialState.labelAttribute);
    };
    ReactDOM.render((
      <LabelEditor attributes={attributes} intl={intl} onChange={onChange} initialState={initialState} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

});
