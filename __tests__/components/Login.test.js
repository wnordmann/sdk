/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import Login from '../../js/components/Login';

describe('Login', function() {

  it('no user is set before login', function() {
    var container = document.createElement('div');
    var login = ReactDOM.render((
      <Login intl={intl} />
    ), container);
    assert.equal(login.state.user, null);
    ReactDOM.unmountComponentAtNode(container);
  });

});
