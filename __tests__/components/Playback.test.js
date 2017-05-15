/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import Playback from '../../src/components/Playback';
import TestUtils from 'react-addons-test-utils';

raf.polyfill();

describe('Playback', function() {
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
    map = new ol.Map({
      target: target,
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    layer = new ol.layer.Vector({
      opacity: 1.0,
      source: new ol.source.Vector({
        url: './data/fires.json',
        format: new ol.format.GeoJSON()
      }),
      id: 'lyr00',
      timeInfo: {
        start: 'STARTDATED',
        end: 'OUTDATED'
      },
      style: null,
      title: 'Fires',
      isSelectable: true
    })
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('has the correct date value', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Playback minDate={500000000000} maxDate={1500000000000} intl={intl} map={map}/>
    ), container);
    assert.equal(container.querySelector('input[type=text]').value.substr(0,7), '1985-11');
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders the playback component', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Playback map={map} intl={intl}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component sdk-playback';
    assert.equal(actual, expected);
  });

  it('assigns default props', function() {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map}/>
    ), container);
    var actual = playback.props.interval;
    var expected = 500;
    assert.equal(actual, expected);
    actual = playback.props.numIntervals;
    expected = 100;
    assert.equal(actual, expected);
    actual = playback.props.autoPlay;
    expected = false;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets initial state [0]', function() {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map}/>
    ), container);
    var actual = playback.state.play;
    var expected = true;
    assert.equal(actual, expected);
    actual = playback.state.minDate;
    expected = undefined;
    assert.equal(actual, expected);
    actual = playback.state.date;
    expected = undefined;
    assert.equal(actual, expected);
    actual = playback.state.maxDate;
    expected = undefined;
    assert.equal(actual, expected);
    actual = playback.state.interval;
    expected = undefined;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets initial state [1]', function() {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map} minDate={50000} maxDate={150000} numIntervals={1000}/>
    ), container);
    var actual = playback.state.play;
    var expected = true;
    assert.equal(actual, expected);
    actual = playback.state.minDate;
    expected = 50000;
    assert.equal(actual, expected);
    actual = playback.state.date;
    expected = 50000;
    assert.equal(actual, expected);
    actual = playback.state.maxDate;
    expected = 150000;
    assert.equal(actual, expected);
    actual = playback.state.interval;
    expected = 100;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets initial properties', function() {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map}/>
    ), container);
    var actual = playback._layers;
    var expected = [];
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('adds loading and loaded', function() {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map}/>
    ), container);
    var actual = playback._loading;
    var expected = 0;
    assert.equal(actual, expected);
    actual = playback._loaded;
    expected = 0;
    assert.equal(actual, expected);
    playback._addLoading();
    actual = playback._loading;
    expected = 1;
    playback._addLoaded();
    assert.equal(actual, expected);
    actual = playback._loaded;
    expected = 1;
    assert.equal(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('changes button icon type based on play/pause state', function(done) {
    var container = document.createElement('div');
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map} minDate={50000} minDate={324511200000} maxDate={1385938800000}/>
    ), container);
    var button = container.querySelector('button');
    var actual = button.children[0].className;
    var expected = 'fa fa-play';
    assert.equal(actual, expected);
    playback.setState({play: false});
    button = container.querySelector('button');
    actual = button.children[0].className;
    expected = 'fa fa-pause';
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('adds correct layers', function(done) {
    var container = document.createElement('div');
    //map.addLayer(layer);
    var playback = ReactDOM.render((
      <Playback intl={intl} map={map} minDate={50000} minDate={324511200000} maxDate={1385938800000}/>
    ), container);
    var actual = playback._layers.length;
    var expected = 0;
    assert.equal(actual, expected);
    map.addLayer(layer);
    actual = playback._layers.length;
    expected = 1;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
