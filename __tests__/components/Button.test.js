/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '../../js/components/Button';

describe('Button', function() {

  it('button gets created', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Button label='My button' tooltip='foo' />
      </MuiThemeProvider>
    ), container);
    var buttons = container.querySelectorAll('button');
    assert.equal(buttons.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
