/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LayerList from '../../src/components/LayerList';
// import TestUtils from 'react-addons-test-utils';

raf.polyfill();

describe('LayerList', function() {
  var target, map, layer, group;
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
      source: new ol.source.OSM()
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
    group =  new ol.layer.Group({
      title: 'Overlays',
      layers: [
        new ol.layer.Group({
          title: 'Overlay 1',
          layers: [
            new ol.layer.Tile({
              title: 'States',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'usa:states'
                }
              })
            }),
            new ol.layer.Tile({
              title: 'Countries',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'opengeo:countries'
                }
              })
            }),
            new ol.layer.Tile({
              title: 'DEM',
              source: new ol.source.TileWMS({
                url: '/geoserver/wms',
                params: {
                  LAYERS: 'usgs:dem'
                }
              })
            })
          ]
        })
      ]
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('generates a list item for our layer', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LayerList intl={intl} map={map}/>
      </MuiThemeProvider>
    ), container);
    var items = container.querySelectorAll('.layer-list-item');
    assert.equal(items.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not generate a list item for our layer if filter', function() {
    var container = document.createElement('div');
    var filter = function(lyr) {
      return false;
    };
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LayerList filter={filter} intl={intl} map={map}/>
      </MuiThemeProvider>
    ), container);
    var items = container.querySelectorAll('.layer-list-item');
    assert.equal(items.length, 0);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles group layers', function() {
    map.removeLayer(layer);
    map.addLayer(group);
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LayerList intl={intl} map={map}/>
      </MuiThemeProvider>
    ), container);
    var faEyes = container.querySelectorAll('.fa-eye');
    assert.equal(faEyes.length, 5);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('turns off other layers when base map parent is selected', function() {
    map.removeLayer(layer);
    map.addLayer(group);
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LayerList intl={intl} map={map}/>
      </MuiThemeProvider>
    ), container);
    var faEyes = container.querySelectorAll('.fa-eye');
    assert.equal(faEyes.length, 5);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does include the children inside the div', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LayerList intl={intl} map={map}>
          <h1 className="children-header">Children Header</h1>
        </LayerList>
      </MuiThemeProvider>
    ), container);
    var items = container.querySelectorAll('.children-header');
    assert.equal(items.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });
});
