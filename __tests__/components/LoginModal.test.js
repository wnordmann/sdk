/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');

var LoginModal = require('../../js/components/LoginModal.jsx');

describe('LoginModal', function() {

  it('inputs for user and password generated', function() {
    var container = document.createElement('div');
    var login = ReactDOM.render((
      <LoginModal intl={intl} />
    ), container);
    login.open();
    var inputs = document.querySelectorAll('input');
    assert.equal(inputs.length, 2);
    ReactDOM.unmountComponentAtNode(container);
  });

});
