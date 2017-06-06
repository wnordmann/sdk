/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Geocoding} from '../../src/components/Geocoding';

describe('Geocoding', function() {

  it('renders the search input field', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Geocoding intl={intl} />
      </MuiThemeProvider>
    ), container);
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
