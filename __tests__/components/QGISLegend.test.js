/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import QGISLegend from '../../js/components/QGISLegend';

raf.polyfill();

describe('QGISLegend', function() {
  var target, map, layer;
  var legendBasePath = './';
  var legendData = {
    'foo': [
        {
          'href': '0_0.png',
          'title': '?'
        }
    ]
  };
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


  it('generates the correct legend url', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <QGISLegend intl={intl} legendBasePath={legendBasePath} legendData={legendData} map={map}/>
    ), container);
    var image = container.querySelector('img');
    assert.equal(image.getAttribute('src'), './0_0.png');
    ReactDOM.unmountComponentAtNode(container);
  });

});
