/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import Chart from '../../src/components/Chart';
import TestUtils from 'react-addons-test-utils';

raf.polyfill();

describe('Chart', function() {
  var target, map, layer, charts;
  var width = 360;
  var height = 180;
  var onClose = function() {};

  beforeEach(function(done) {
    charts = [{
      title: 'Forest area total surface',
      categoryField: 'VEGDESC',
      layer: 'lyr01',
      valueFields: ['AREA_KM2'],
      displayMode: 1,
      operation: 2
    }];
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);
    layer = new ol.layer.Vector({
      id: 'lyr01',
      source: new ol.source.Vector({})
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

  it('generates the correct combo', function() {
    var container = document.createElement('div');
    ReactDOM.render((
        <Chart intl={intl} onClose={onClose} charts={charts} />
    ), container);
    var divs = container.querySelectorAll('div');
    var found = false;
    for (var i = 0, ii = divs.length; i < ii; ++i) {
      if (divs[i].innerHTML === charts[0].title) {
        found = true;
        break;
      }
    }
    assert.equal(found, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets initial state', function() {
    var container = document.createElement('div');
    var chart = ReactDOM.render((
        <Chart intl={intl} onClose={onClose} charts={charts} />
    ), container);
    var actual = chart.state.chart;
    var expected = charts[0];
    assert.deepEqual(actual, expected);
    actual = chart.state.value;
    expected = charts[0].title;
    assert.equal(actual, expected);
    actual = chart.state.selected;
    expected = null;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('gets columns by display mode 2', function() {
    var container = document.createElement('div');
    var chart = ReactDOM.render((
        <Chart intl={intl} onClose={onClose} charts={charts} />
    ), container);
    charts[0].displayMode = 2;
    var actual = chart._getColumns();
    var expected = [['x'], ['foo']];
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('gets columns by display mode 1', function() {
    var container = document.createElement('div');
    var chart = ReactDOM.render((
        <Chart intl={intl} onClose={onClose} charts={charts} />
    ), container);
    var actual = chart._getColumns();
    var expected = [['x'], ['AREA_KM2']];
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('gets columns by display mode 0', function() {
    var container = document.createElement('div');
    var chart = ReactDOM.render((
        <Chart intl={intl} onClose={onClose} charts={charts} />
    ), container);
    charts[0].displayMode = 0;
    var actual = chart._getColumns();
    var expected = [['x'], ['AREA_KM2']];
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders the chart component', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Chart intl={intl} onClose={onClose} charts={charts}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component chart';
    assert.equal(actual, expected);
  });

});
