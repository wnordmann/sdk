/** Very basic SDK application example.
 *
 *  Contains a Map and demonstrates some of the dynamics of
 *  using the store.
 *
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkHashHistory from '@boundlessgeo/sdk/components/history';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

// This will have webpack include all of the SDK styles.
import '@boundlessgeo/sdk/stylesheet/sdk.scss';

import toGeoJSON from './togeojson';
import fetch from 'isomorphic-fetch';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

function main() {
  // Start with a reasonable global view of the map.
  store.dispatch(mapActions.setView([-93, 45], 2));

  store.dispatch(mapActions.setMapName('Basic Map Example'));

  // add the OSM source
  store.dispatch(mapActions.addSource('osm', {
    type: 'raster',
    tileSize: 256,
    tiles: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ],
  }));

  // and an OSM layer.
  // Raster layers need not have any paint styles.
  store.dispatch(mapActions.addLayer({
    id: 'osm',
    source: 'osm',
  }));

  const loadGpx = (sourceName) => {
    fetch('./test.gpx')
      .then(
        response => response.text(),
        error => console.error('An error occured.', error),
      )
      // addFeatures with the features, source name
      .then(text => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text,"text/xml");
        const geoJson = toGeoJSON.gpx(xmlDoc);
        store.dispatch(mapActions.addSource("bike", {type:'geoJson', data: geoJson}));
        store.dispatch(mapActions.addLayer({
          id: "bikeLayer",
          source: "bike",
          layout: {
            "line-cap": "butt",
            "line-join": "round"
          },
          paint: {
            "line-color": "rgba(140, 140, 47, 1)",
            "line-width": 2
          }
        }));
      });
  };
  const loadJson = (sourceName) => {
    fetch('./taxcode.geojson')
      .then(
        response => response.json(),
        error => console.error('An error occured.', error),
      )
      // addFeatures with the features, source name
      .then(json => {
        // const parser = new DOMParser();
        // const xmlDoc = parser.parseFromString(text,"text/xml");
        // const geoJson = toGeoJSON.gpx(xmlDoc);
        store.dispatch(mapActions.addSource("tax", {type:'geoJson', data: json}));
        // setup the polys layer
        store.dispatch(mapActions.addLayer({
          id: 'taxLayer',
          source: 'tax',
          type: 'fill',
          paint: {
            'fill-opacity': 0.7,
            'fill-color': '#feb24c',
            'fill-outline-color': '#f03b20',
          },
        }));
      });
  };


  // place the map on the page.
  ReactDOM.render(<SdkMap store={store} showZoomSlider />, document.getElementById('map'));

  // add some buttons to demo some actions.
  ReactDOM.render((
    <div>
      <button className="sdk-btn" onClick={loadGpx}>LoadGPX</button>
      <button className="sdk-btn" onClick={loadJson}>LoadJson</button>
    </div>
  ), document.getElementById('controls'));
}

main();
