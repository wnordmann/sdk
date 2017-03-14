/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import FillEditor from '../../src/components/FillEditor';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

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
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <FillEditor intl={intl} onChange={onChange} initialFillColor={initialState.fillColor} />
      </MuiThemeProvider>
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

});
