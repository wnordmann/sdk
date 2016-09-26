/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;

var Button = require('../../js/components/Button.jsx');

describe('Button', function() {

  it('button gets created', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Button label='My button' tooltip='foo' />
    ), container);
    var buttons = container.querySelectorAll('button');
    assert.equal(buttons.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
