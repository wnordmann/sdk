/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var EditForm = require('../../js/components/EditForm.jsx');

describe('EditForm', function() {

  it('generates the correct color', function() {
    var container = document.createElement('div');
    var feature = new ol.Feature({foo: 'bar'});
    var layer = new ol.layer.Vector({
      wfsInfo: {
        attributes: ['foo']
      },
      source: new ol.source.Vector({})
    });
    ReactDOM.render((
      <EditForm intl={intl} feature={feature} layer={layer} />
    ), container);
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs[0].id, 'foo');
    assert.equal(inputs[0].value, 'bar');
    ReactDOM.unmountComponentAtNode(container);
  });

});
