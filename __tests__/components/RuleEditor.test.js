/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');
var raf = require('raf');
raf.polyfill();
require('phantomjs-polyfill-object-assign');

var RuleEditor = require('../../js/components/RuleEditor.jsx');

describe('RuleEditor', function() {

  it('fires onChange', function() {
    var container = document.createElement('div');
    var onChange = function(state) {
      assert.equal(state.labelAttribute, null);
    };
    var attributes = ['foo', 'bar'];
    ReactDOM.render((
      <RuleEditor attributes={attributes} visible={true} onChange={onChange} intl={intl} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not fire onChange if visible is false', function() {
    var container = document.createElement('div');
    var called = false;
    var onChange = function(state) {
      called = true;
    };
    var attributes = ['foo', 'bar'];
    ReactDOM.render((
      <RuleEditor attributes={attributes} visible={false} onChange={onChange} intl={intl} />
    ), container);
    assert.equal(called, false);
    ReactDOM.unmountComponentAtNode(container);
  });

});
