/* global it, describe, expect, spyOn */

import React from 'react';
import { mount } from 'enzyme';

import { createStore, combineReducers } from 'redux';

import ConnectedMap from '../../src/components/map';
import MapReducer from '../../src/reducers/map';
import * as MapActions from '../../src/actions/map';

describe('Map component time tests', () => {
  it('should correctly reload WMS source that is time enabled', () => {
    const store = createStore(combineReducers({
      map: MapReducer,
    }));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    store.dispatch(MapActions.setView([-98, 40], 4));

    const getMapUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=nexrad-n0r-wmst&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}';
    store.dispatch(MapActions.addSource('mesonet', {
      type: 'raster',
      tileSize: 256,
      tiles: [getMapUrl],
    }));
    store.dispatch(MapActions.addLayer({
      id: 'nexrad',
      source: 'mesonet',
    }));
    store.dispatch(MapActions.setLayerTime('nexrad', '1995-01-01/2017-12-31/PT5M'));

    let layers = map.map.getLayers().getArray();
    const source = layers[0].getSource();
    let params = source.getParams();
    expect(params.TIME).toBeUndefined();
    store.dispatch(MapActions.setMapTime('2006-06-23T03:10:00Z'));
    params = source.getParams();
    expect(params.TIME).toBe('2006-06-23T03:10:00Z');
  });

  it('should correctly set TIME param if source added after setMapTime', () => {
    const store = createStore(combineReducers({
      map: MapReducer,
    }));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    store.dispatch(MapActions.setView([-98, 40], 4));
    store.dispatch(MapActions.setMapTime('2006-06-23T03:10:00Z'));

    const getMapUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=nexrad-n0r-wmst&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}';
    store.dispatch(MapActions.addSource('mesonet', {
      type: 'raster',
      tileSize: 256,
      tiles: [getMapUrl],
    }));
    store.dispatch(MapActions.addLayer({
      id: 'nexrad',
      source: 'mesonet',
    }));
    store.dispatch(MapActions.setLayerTime('nexrad', '1995-01-01/2017-12-31/PT5M'));

    let layers = map.map.getLayers().getArray();
    const source = layers[0].getSource();
    const params = source.getParams();
    expect(params.TIME).toBe('2006-06-23T03:10:00Z');
  });

  it('should correctly filter a vector source that is time enabled', () => {
    const store = createStore(combineReducers({
      map: MapReducer,
    }));

    const createLayerFilter = (layer, mapTime) => {
    };

    const props = {
      store,
      createLayerFilter,
    };
    spyOn(props, 'createLayerFilter').and.returnValue('dummyfilter');

    const wrapper = mount(<ConnectedMap {...props} />);
    const map = wrapper.instance().getWrappedInstance();

    store.dispatch(MapActions.setView([-98, 40], 4));

    const data = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
        properties: {
          mag: 6,
          time: 500
        },
      }, {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-45, 0],
        },
        properties: {
          mag: 8,
          time: 1000
        },
      }],
    };

    store.dispatch(MapActions.addSource('earthquakes', {
      type: 'geojson',
      data: data
    }));

    const layerConfig = {
      metadata: {
        'bnd:timeattribute': 'time'
      },
      id: 'earthquakes',
      type: 'circle',
      source: 'earthquakes',
      paint: {
        'circle-color': {
          property: 'mag',
          stops: [
            [6, '#FCA107'],
            [8, '#7F3121']
          ]
        },
        'circle-opacity': 0.75,
        'circle-radius': {
          property: 'mag',
          stops: [
            [6, 20],
            [8, 40]
          ]
        }
      }
    };

    store.dispatch(MapActions.addLayer(layerConfig));
    // dummy range for testing, for applications ISO8601 with moment would normally be used
    store.dispatch(MapActions.setMapTime('200,500'));
    expect(props.createLayerFilter).toHaveBeenCalled();
    expect(map.props.map.layers[0].filter).toBe('dummyfilter');
  });
});
