/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import TestUtils from 'react-addons-test-utils';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import Button from '../../src/components/Button';

describe('Button', function() {

  it('button gets created', function() {
    var container = document.createElement('div');
    var called = false;
    var onClick = function() {
      called = true;
    };
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Button onTouchTap={onClick} label='My button' tooltip='foo' />
      </MuiThemeProvider>
    ), container);
    var buttons = container.querySelectorAll('button');
    assert.equal(buttons.length, 1);
    TestUtils.Simulate.touchTap(buttons[0]);
    assert.equal(called, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('button in dialog calls onTouchTap', function() {
    var container = document.createElement('div');
    var called = false;
    var onClick = function() {
      called = true;
    };
    var actions = [
      <Button onTouchTap={onClick} label='My button' tooltip='foo' />
    ];
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Dialog title='foo' actions={actions} modal={false} open={true} />
      </MuiThemeProvider>
    ), container);
    var buttons = document.body.querySelectorAll('button');
    TestUtils.Simulate.touchTap(buttons[0]);
    assert.equal(called, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
