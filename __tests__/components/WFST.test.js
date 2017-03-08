/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import ToolActions from '../../js/actions/ToolActions';
import WFST from '../../js/components/WFST';

raf.polyfill();

describe('WFST', function() {
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


  it('generates the correct layer selector', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <WFST intl={intl} map={map}/>
    ), container);
    // TODO fix up test case
    //var options = container.querySelectorAll('option');
    //assert.equal(options.length, 1);
    //assert.equal(options[0].text, 'My Layer');
    //assert.equal(options[0].value, 'foo');
    ReactDOM.unmountComponentAtNode(container);
  });

  it('generates no layer selector', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <WFST layerSelector={false} intl={intl}  map={map}/>
    ), container);
    var select = container.querySelector('.layer-selector');
    assert.equal(select, undefined);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('activates draw feature', function() {
    var container = document.createElement('div');
    var wfst = ReactDOM.render((
      <WFST layerSelector={false} intl={intl}  map={map}/>
    ), container);
    wfst.state.layer = map.getLayers().item(0);
    wfst._drawFeature();
    var draw = wfst._interactions['foo'].draw;
    assert.equal(draw instanceof ol.interaction.Draw, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('aborts pending requests on unmount', function() {
    var container = document.createElement('div');
    var wfst = ReactDOM.render((
      <WFST layerSelector={false} intl={intl}  map={map}/>
    ), container);
    wfst.state.layer = map.getLayers().item(0);
    wfst._onDrawEnd({feature: new ol.Feature({foo: 'bar'})});
    ReactDOM.unmountComponentAtNode(container);
  });

  it('disables the tool', function() {
    var container = document.createElement('div');
    var wfst = ReactDOM.render((
      <WFST layerSelector={false} intl={intl}  map={map}/>
    ), container);
    assert.equal(wfst.state.disabled, false);
    ToolActions.disableAllTools();
    assert.equal(wfst.state.disabled, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
