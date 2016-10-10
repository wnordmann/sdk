/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var intl = require('../mock-i18n.js');

var FilterEditor = require('../../js/components/FilterEditor.jsx');

describe('FilterEditor', function() {

  it('renders correctly', function() {
    var container = document.createElement('div');
    var onChange = function(result) {
    };
    var editor = ReactDOM.render((
      <FilterEditor onChange={onChange} intl={intl} />
    ), container);
    editor._setQueryFilter({target: {value: 'foo = "bar"'}});
    assert.equal(editor.state.hasError, true);
    editor._setQueryFilter({target: {value: 'foo == "bar"'}});
    assert.equal(editor.state.hasError, false);
    ReactDOM.unmountComponentAtNode(container);
  });

});
