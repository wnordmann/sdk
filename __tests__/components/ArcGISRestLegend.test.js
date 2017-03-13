/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import ArcGISRestLegend from '../../src/components/ArcGISRestLegend';

raf.polyfill();

describe('ArcGISRestLegend', function() {

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
    layer = new ol.layer.Tile({
      id: '0',
      source: new ol.source.TileArcGISRest({
        url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer',
        params: {
          LAYERS: '0'
        }
      })
    });
    document.body.appendChild(target);
    map = new ol.Map({
      layers: [layer],
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

  it('creates arcgis rest legend component', function(done) {
    var container = document.createElement('div');
    var legend = ReactDOM.render((
      <ArcGISRestLegend layer={layer}/>
    ), container);
    assert.equal(legend !== undefined, true);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });
});
