/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import LayerListItem from '../../src/components/LayerListItem';
import TestUtils from 'react-addons-test-utils';

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
      source: new ol.source.OSM(),
      wfsInfo: 'foo',
      isWFST: true
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

  it('renders dragging item', function() {
    var container = document.createElement('div');
    var item = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay} />
    ), container);
    var newItem = 'foo';
    var actual = item.renderItem(newItem, true).type;
    var expected = 'div';
    assert.equal(actual, expected);
    actual = item.renderItem(newItem, false);
    expected = undefined;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders the layerlist item component', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay}/>);
    const actual = renderer.getRenderOutput().props.children[0].props.className;
    const expected = 'layer-list-item';
    assert.include(actual, expected);
  });

  it('renders the filter, table, style, and label modals', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay}/>);
    var filterModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[0].ref;
    assert.equal(filterModal, 'filterModal');
    var labelModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[1].ref;
    assert.equal(labelModal, 'labelModal');
    var styleModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[2];
    assert.equal(styleModal, undefined);
    var tableModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[3];
    assert.equal(tableModal, undefined);
    renderer.getMountedInstance().componentWillUnmount();
    renderer.render(<LayerListItem index={0} moveLayer={function() {}} intl={intl} title={layer.get('title')} map={map} layer={layer} allowStyling={true} showTable={true}/>);
    filterModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[0];
    assert.equal(filterModal, undefined);
    labelModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[1];
    assert.equal(labelModal, undefined);
    styleModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[2].ref;
    assert.equal(styleModal, 'styleModal');
    tableModal = renderer.getRenderOutput().props.children[1].props.children[1].props.children[3].ref;
    assert.equal(tableModal, 'tableModal');
  });

  it('calculates resolution range', function() {
    var container = document.createElement('div');
    var item = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={layer.get('title')} map={map} layer={layer} />
    ), container);
    var actual = item.props.handleResolutionChange;
    var expected = undefined;
    assert.equal(actual, expected);
    actual = item.calculateInRange();
    expected = true;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
    var item2 = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={layer.get('title')} map={map} layer={layer} handleResolutionChange={true}/>
    ), container);
    actual = item2.props.handleResolutionChange;
    expected = true;
    assert.equal(actual, expected);
    actual = item2.calculateInRange();
    expected = true;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('changes opacity', function() {
    var container = document.createElement('div');
    var item = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={layer.get('title')} map={map} layer={layer} />
    ), container);
    var actual = layer.getOpacity();
    var expected = 1;
    assert.equal(actual, expected);
    item._changeOpacity(null, 0.5);
    actual = layer.getOpacity();
    expected = 0.5;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles opening and closing syling', function() {
    var container = document.createElement('div');
    var item = ReactDOM.render((
      <LayerListItem index={0} moveLayer={function() {}} intl={intl} title={overlay.get('title')} map={map} layer={overlay} allowReordering={true}/>
    ), container);
    var actual = item.state.styleOpen;
    var expected = false;
    assert.equal(actual, expected);
    item._showStyling();
    actual = item.state.styleOpen;
    expected = true;
    assert.equal(actual, expected);
    item._closeStyling();
    actual = item.state.styleOpen;
    expected = false;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

});
