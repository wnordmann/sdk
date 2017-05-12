/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import InfoPopup from '../../src/components/InfoPopup';
import TestUtils from 'react-addons-test-utils';

raf.polyfill();

describe('InfoPopup', function() {
  var target, map, layers;
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
    layers = [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Tile({
        name: 'x',
        visible: false,
        source: new ol.source.TileWMS({url: 'http://foo', params: {LAYERS: 'x'}})
      }),
      new ol.layer.Tile({
        name: 'y',
        popupInfo: '#AllAttributes',
        source: new ol.source.TileWMS({url: 'http://foo', params: {LAYERS: 'y'}})
      }),
      new ol.layer.Vector({
        id: 'lyr01',
        isSelectable: true,
        geometryType: 'Polygon',
        attributes: ['cat', 'VEGDESC', 'VEG_ID', 'F_CODEDESC', 'F_CODE', 'AREA_KM2'],
        title: 'trees',
        source: new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          url: './data/trees.json'
        })
      })
    ];
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


  it('callback gets called even if no XHR is performed', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var callbackCalled = false;
    popup._fetchData({}, [], function() {
      callbackCalled = true;
    });
    assert.equal(callbackCalled, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('correct set of layers is taken into consideration', function() {
    var container = document.createElement('div');
    layers.forEach(function(layer) {
      map.addLayer(layer);
    });
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var infoLayers = popup._getLayers();
    assert.equal(infoLayers.length, 1);
    layers[1].setVisible(true);
    layers[1].set('popupInfo', '[foo]');
    infoLayers = popup._getLayers();
    assert.equal(infoLayers.length, 2);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets correct initial properties', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var actual = popup.active;
    var expected = true;
    assert.equal(actual, expected);
    actual = popup._count;
    expected = 0;
    assert.equal(actual, expected);
    actual = popup.state;
    expected = {
      popupTexts: []
    };
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('toggles activation', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    assert.equal(popup.active, true);
    popup.deactivate();
    assert.equal(popup.active, false);
    popup.activate(null);
    assert.equal(popup.active, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders the popup', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<InfoPopup intl={intl} map={map}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component info-popup';
    assert.equal(actual, expected);
  });

  it('updates count', function() {
    var container = document.createElement('div');
    layers.forEach(function(layer) {
      map.addLayer(layer);
    });
    var feature = new ol.Feature({});
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var actual = popup._count;
    var expected = 0;
    assert.equal(actual, expected);
    popup._createSimpleTable({features: feature, layer: layers[2]});
    actual = popup._count;
    expected = 1;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets default props', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var actual = popup.props.hover;
    var expected = false;
    assert.equal(actual, expected);
    actual = popup.props.toolId;
    expected = 'nav';
    assert.equal(actual, expected);
    actual = popup.props.infoFormat;
    expected = 'text/plain';
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not update popup content when deactivated', function() {
    var container = document.createElement('div');
    var popup = ReactDOM.render((
      <InfoPopup intl={intl} map={map} />
    ), container);
    var actual = popup.state.contentAsObject;
    var expected = undefined;
    assert.equal(actual, expected);
    actual = popup._contentAsObject;
    expected = undefined;
    assert.equal(actual, expected);
    popup.deactivate();
    popup._onMapClick(null);
    actual = popup.state.contentAsObject;
    expected = undefined;
    assert.equal(actual, expected);
    actual = popup._contentAsObject;
    expected = undefined;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

});
