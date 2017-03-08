/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TestUtils from 'react-addons-test-utils';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Dialog from '../../js/components/Dialog';

describe('Dialog', function() {

  it('has div if open is true', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Dialog inline={false} open={true}>
          <div id='foo'></div>
        </Dialog>
      </MuiThemeProvider>
    ), container);
    var div = document.getElementById('foo');
    assert.equal(container.contains(div), false); // not a child if inline is false
    assert.equal(div !== null, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not have div if open is false', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Dialog inline={false} open={false}>
          <div id='foo'></div>
        </Dialog>
      </MuiThemeProvider>
    ), container);
    var div = document.getElementById('foo');
    assert.equal(div, null);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('div is child if inline is true', function() {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Dialog inline={true} open={true}>
          <div className='foo'></div>
        </Dialog>
      </MuiThemeProvider>
    ), container);
    var div = TestUtils.findRenderedDOMComponentWithClass(dialog, 'foo');
    assert.equal(div !== null, true);
    assert.equal(container.contains(div), true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('actions are taken into account', function() {
    var container = document.createElement('div');
    var actions = [<div className='myaction'></div>];
    var dialog = ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Dialog inline={true} open={true} actions={actions}>
          <div className='foo'></div>
        </Dialog>
      </MuiThemeProvider>
    ), container);
    var action = TestUtils.findRenderedDOMComponentWithClass(dialog, 'myaction');
    assert.equal(action !== null, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
