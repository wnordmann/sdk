/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import StrokeEditor from '../../js/components/StrokeEditor';

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
