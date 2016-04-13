/* global describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var intl = require('../mock-i18n.js');

var AddLayerModal = require('../../js/components/AddLayerModal.jsx');

describe('AddLayerModal', function() {

  it('generates the correct GetCapabilities url', function() {
    var container = document.createElement('div');
    var url = 'http://localhost:8080/geoserver/wms';
    var modal = ReactDOM.render((
      <AddLayerModal allowUserInput={true} url={url} intl={intl} />
    ), container);
    var caps = modal._getCapabilitiesUrl(url);
    assert.equal(caps, url + '?service=WMS&request=GetCapabilities&version=1.3.0');
    ReactDOM.unmountComponentAtNode(container);
  });

});
