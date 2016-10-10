/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');

var Geocoding = require('../../js/components/Geocoding.jsx');

describe('Geocoding', function() {

  it('renders the search input field', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Geocoding intl={intl} />
    ), container);
    var inputs = container.querySelectorAll('input');
    assert(inputs.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
