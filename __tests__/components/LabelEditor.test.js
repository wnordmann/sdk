/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import LabelEditor from '../../js/components/LabelEditor';

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
