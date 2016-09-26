/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');

var Login = require('../../js/components/Login.jsx');

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
