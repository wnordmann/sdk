/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import Edit from '../../js/components/Edit';

raf.polyfill();

describe('Edit', function() {
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


  it('generates the correct layer selector', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Edit map={map} intl={intl} />
    ), container);
    assert.equal(container.querySelector('.edit-layer-selector') !== null, true);
    var options = container.querySelectorAll('.edit-layer-selector-option');
    assert.equal(options.length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

});
