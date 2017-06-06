/* global beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import {MapPanel} from '../../src/components/MapPanel';

raf.polyfill();

describe('MapPanel', function() {
  var map, layer;

  beforeEach(function(done) {
    layer = new ol.layer.Vector({
      source: new ol.source.Vector({})
    });
    map = new ol.Map({
      layers: [layer],
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  it('sets the target for the map', function() {
    var container = document.createElement('div');
    assert.equal(map.getTarget() === undefined, true);
    ReactDOM.render((
      <MapPanel intl={intl} id='map' map={map} />
    ), container);
    assert.equal(map.getTarget() !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('fits the extent if useHistory is false', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MapPanel intl={intl} useHistory={false} extent={[-100, -100, 0, 0]} id='map' map={map} />
    ), container);
    assert.equal(map.getView().getCenter()[0], -50);
    assert.equal(map.getView().getCenter()[1], -50);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('fits the extent if useHistory is true', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MapPanel intl={intl} extent={[-100, -100, 0, 0]} id='map' map={map} />
    ), container);
    assert.equal(map.getView().getCenter()[0], -50);
    assert.equal(map.getView().getCenter()[1], -50);
    ReactDOM.unmountComponentAtNode(container);
  });

});
