/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import ToolActions from '../../src/actions/ToolActions';
import QGISPrint from '../../src/components/QGISPrint';
import TestUtils from 'react-addons-test-utils';

raf.polyfill();

describe('QGISPrint', function() {
  var target, map, layer;
  var width = 360;
  var height = 180;

  var printLayouts = [{
    name: 'Layout 1',
    thumbnail: 'layout1_thumbnail.png',
    width: 420.0,
    elements: [{
      name: 'Element 1',
      height: 40.825440467359044,
      width: 51.98353115727002,
      y: 39.25222551928783,
      x: 221.77507418397624,
      font: 'Helvetica',
      type: 'label',
      id: '24160ce7-34a3-4f25-a077-8910e4889681',
      size: 18
    }, {
      height: 167.0,
      width: 171.0,
      grid: {
        intervalX: 0.0,
        intervalY: 0.0,
        annotationEnabled: false,
        crs: ''
      },
      y: 19.0,
      x: 16.0,
      type: 'map',
      id: '3d532cb9-0eca-4e50-9f0a-ce29b1c7f5a6'
    }],
    height: 297.0
  }];

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

  it('sets default props', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} />
    ), container);
    var actual = print.props.menu;
    var expected = true;
    assert.equal(actual, expected);
    actual = print.props.thumbnailPath;
    expected = '../../resources/print/';
    assert.equal(actual, expected);
    actual = print.props.resolutions;
    expected = [72, 150];
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets initial state', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    var actual = print.state;
    var expected = {
      disabled: false,
      layout: null,
      layoutName: null,
      loading: false,
      error: false,
      open: false,
      errorOpen: false,
      resolution: null
    };
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('changes resolution state', function(done) {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    print._onResolutionChange(null, null, 72);
    var actual = print.state.resolution;
    var expected = 72;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done()
    }, 500);
  });

  it('closes error', function(done) {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    print.setState({errorOpen: true});
    print._handleRequestClose();
    var actual = print.state.errorOpen;
    var expected = false;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done()
    }, 500);
  });

  it('loading state gets set on print', function(done) {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    print._onClick(printLayouts[0]);
    print._print();
    assert.equal(print.state.loading, true);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done()
    }, 500);
  });

  it('getTileLayers returns correct number of layers', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    assert.equal(print._getTileLayers().length, 1);
    print.props.map.removeLayer(layer);
    assert.equal(print._getTileLayers().length, 0);
    print.props.map.addLayer(
      new ol.layer.Vector({
        id: 'foo',
        source: new ol.source.Vector({
        })
      })
    );
    assert.equal(print._getTileLayers().length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('adds tile layers loaded', function(done) {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    print._tiledLayersLoaded = 1;
    print._tileLayers = print._getTileLayers();
    print._tileLayerLoaded();
    var actual = print._tiledLayersLoaded;
    var expected = 2;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done()
    }, 500);
  });

  it('disables the tool', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map}/>
    ), container);
    assert.equal(print.state.disabled, false);
    ToolActions.disableAllTools();
    assert.equal(print.state.disabled, true);
    ToolActions.enableAllTools();
    assert.equal(print.state.disabled, false);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('adds elements loaded [0]', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    print._onClick(printLayouts[0]);
    print._print();
    assert.equal(print.state.layout.elements.length, 2);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('adds elements loaded [1]', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    print.setState({layout: printLayouts[0]});
    print._elementsLoaded = 0;
    print._elementLoaded();
    var actual = print._elementsLoaded;
    var expected = 1;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });


  it('opens menu on click and sets layout', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    print._onClick(printLayouts[0]);
    assert.equal(print.state.open, true);
    assert.equal(print.state.layoutName, 'Layout 1');
    assert.deepEqual(print.state.layout, printLayouts[0]);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('opens print dialog on click and sets layout', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    print._onPrintButtonClick();
    assert.equal(print.state.open, true);
    assert.equal(print.state.layoutName, 'Layout 1');
    assert.deepEqual(print.state.layout, printLayouts[0]);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders the component', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<QGISPrint intl={intl} layouts={printLayouts} map={map} />);
    var actual = renderer.getRenderOutput().props.className;
    var expected = 'sdk-component qgis-print';
    assert.equal(actual, expected);
    actual = renderer.getRenderOutput().props.children[0].key;
    expected = 'qgis-print menu';
    assert.equal(actual, expected);
    renderer.render(<QGISPrint intl={intl} layouts={printLayouts} map={map} menu={false}/>);
    actual = renderer.getRenderOutput().props.className;
    expected = 'sdk-component qgis-print';
    assert.equal(actual, expected);
    actual = renderer.getRenderOutput().props.children[0].key;
    expected = 'qgis-print btn';
    assert.equal(actual, expected);
  });

  it('closes', function() {
    var container = document.createElement('div');
    var print = ReactDOM.render((
      <QGISPrint intl={intl} layouts={printLayouts} map={map} thumbnailPath={""}/>
    ), container);
    print.setState({open: true});
    print.close();
    var actual = print.state.open;
    var expected = false;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

});
