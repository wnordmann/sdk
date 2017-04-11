/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import ToolActions from '../../src/actions/ToolActions';
import DrawFeature from '../../src/components/DrawFeature';

raf.polyfill();

describe('DrawFeature', function() {
  var target, map, layer;
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
    layer = new ol.layer.Tile({
      id: 'foo',
      name: 'geonode:foo',
      isWFST: true,
      wfsInfo: {
        geometryType: 'MultiPoint',
        geometryName: 'the_geom'
      },
      title: 'My Layer',
      source: new ol.source.OSM()
    });
    map = new ol.Map({
      target: target,
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

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('activates draw feature', function() {
    var container = document.createElement('div');
    var draw = ReactDOM.render((
      <DrawFeature intl={intl}  map={map}/>
    ), container);
    draw._drawPoly();
    var drawInteraction = draw._interactions.polygon;
    assert.equal(drawInteraction instanceof ol.interaction.Draw, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('disables the tool', function() {
    var container = document.createElement('div');
    var draw = ReactDOM.render((
      <DrawFeature intl={intl}  map={map}/>
    ), container);
    assert.equal(draw.state.disabled, false);
    ToolActions.disableAllTools();
    assert.equal(draw.state.disabled, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
