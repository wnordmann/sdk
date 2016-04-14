/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;

var Toolbar = require('../../js/components/Toolbar.jsx');

describe('Toolbar', function() {

  it('shows the correct number of items', function() {
    var container = document.createElement('div');
    var options = [{
      text: 'foo'
    }, {
      text: 'bar'
    }, {
      text: 'foobar'
    }];
    ReactDOM.render((
      <Toolbar options={options} />
    ), container);
    var menuitems  = container.querySelectorAll('[role=menuitem]');
    assert.equal(menuitems.length, 3);
    ReactDOM.unmountComponentAtNode(container);
  });

});
