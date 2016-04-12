/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var intl = require('../mock-i18n.js');

var FilterEditor = require('../../js/components/FilterEditor.jsx');

describe('FilterEditor', function() {

  it('adds the correct class on error', function() {
    var container = document.createElement('div');
    var onChange = function(result) {
    };
    ReactDOM.render((
      <FilterEditor onChange={onChange} intl={intl} />
    ), container);
    var input = container.querySelector('input');
    input.value = 'foo = "bar"';
    TestUtils.Simulate.keyUp(input);
    assert.equal(input.className, 'form-control input-has-error');
    input.value = 'foo == "bar"';
    TestUtils.Simulate.keyUp(input);
    assert.equal(input.className, 'form-control');
    ReactDOM.unmountComponentAtNode(container);
  });

});
