/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import EditPopup from '../../src/components/EditPopup';

raf.polyfill();

describe('EditPopup', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('no edit form inputs get rendered if there is no feature', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <EditPopup intl={intl} map={map} />
    ), container);
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs.length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('generates the correct inputs', function() {
    var container = document.createElement('div');
    var feature = new ol.Feature({foo: 'bar'});
    feature.setId('foo.1');
    var layer = new ol.layer.Vector({
      wfsInfo: {
        attributes: ['foo']
      },
      source: new ol.source.Vector({})
    });
    var popup = ReactDOM.render((
        <EditPopup map={map} intl={intl} />
    ), container);
    popup.setState({layer: layer, feature: feature, values: feature.getProperties()});
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs[0].id, 'foo');
    assert.equal(inputs[0].value, 'bar');
    ReactDOM.unmountComponentAtNode(container);
  });

});
