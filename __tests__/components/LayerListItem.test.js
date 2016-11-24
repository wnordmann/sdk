/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import LayerListItem from '../../js/components/LayerListItem';

raf.polyfill();

describe('LayerListItem', function() {
  var target, map, layer, overlay;
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
    layer = new ol.layer.Tile({
      id: 'osm',
      type: 'base',
      title: 'Streets',
      source: new ol.source.OSM()
    });
    overlay = new ol.layer.Vector({
      id: 'vector',
      title: 'Earthquakes',
      source: new ol.source.Vector({})
    });
    document.body.appendChild(target);
    map = new ol.Map({
      layers: [layer, overlay],
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


  it('generates a list item for our layer but no zoom in for base layer', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={layer.get('title')} map={map} layer={layer} />
    ), container);
    var zoomIn = container.querySelector('.layer-list-item-zoom');
    assert.equal(zoomIn, undefined);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('generates a list item for our layer with zoom in for overlay', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay} />
    ), container);
    var zoomIn = container.querySelector('layer-list-item-zoom');
    assert.equal(zoomIn !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('modifies lat lon extent for EPSG:3857', function() {
    var container = document.createElement('div');
    var item = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay} />
    ), container);
    var bbox = [-170, -90, 170, 90];
    item._modifyLatLonBBOX(bbox);
    assert.equal(bbox[0], -170);
    assert.equal(bbox[1], -85);
    assert.equal(bbox[2], 170);
    assert.equal(bbox[3], 85);
    ReactDOM.unmountComponentAtNode(container);
  });

});
