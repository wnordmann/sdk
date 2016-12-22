/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import BaseMapModal from '../../js/components/BaseMapModal';

raf.polyfill();

describe('BaseMapModal', function() {
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
    layer = new ol.layer.Vector({
      source: new ol.source.Vector({})
    });
    document.body.appendChild(target);
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


  it('creates the dialog without errors', function(done) {
    var container = document.createElement('div');
    var tileServices = [{
      name: 'light_all',
      description: 'CartoDB light',
      endpoint: 'http://s.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      standard: 'XYZ',
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      thumbnail: 'http://s.basemaps.cartocdn.com/light_all/0/0/0.png'
    }];
    ReactDOM.render((
      <BaseMapModal map={map} tileServices={tileServices} intl={intl} />
    ), container, function() {
      this.open();
      assert.equal(this.state.open, true);
    });
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
