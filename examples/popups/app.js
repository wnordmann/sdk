/** Popup application.
 *
 *  Contains a Map and demonstrates using addPopup to embed
 *  React components in popups on the map.
 *
 */

import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkZoomControl from '@boundlessgeo/sdk/components/map/zoom-control';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import SdkPopup from '@boundlessgeo/sdk/components/map/popup';

import * as mapActions from '@boundlessgeo/sdk/actions/map';

// This will have webpack include all of the SDK styles.
import '@boundlessgeo/sdk/stylesheet/sdk.scss';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
applyMiddleware(thunkMiddleware));


/** A popup for marking features when they
 *  are selected.
 */
class MarkFeaturesPopup extends SdkPopup {

  markFeatures() {
    const feature_ids = [];
    const features = this.props.features;

    for (let i = 0, ii = features.length; i < ii; i++) {
      // create an array of ids to be removed from the map.
      feature_ids.push(features[i].properties.id);
      // set the feature property to "marked".
      features[i].properties.isMarked = true;
    }

    // remove the old unmarked features
    store.dispatch(mapActions.removeFeatures('points', ['in', 'id'].concat(feature_ids)));
    // add the new freshly marked features.
    store.dispatch(mapActions.addFeatures('points', features));
    // close this popup.
    this.close();
  }

  render() {
    const feature_ids = this.props.features.map(f => f.properties.id);

    return this.renderPopup((
      <div className="sdk-popup-content">
        You clicked here:<br />
        <code>
          { this.props.coordinate.hms }
        </code>
        <br />
        <p>
          Feature ID(s):<br />
          <code>{ feature_ids.join(', ') }</code>
          <br />
          <button className="sdk-btn" onClick={() => {
            this.markFeatures();
          }}>
            Mark this feature
          </button>
        </p>
      </div>
    ));
  }
}

/** This is an example of a static popup.
 *  It has a label and a close button.
 */
class NullIslandPopup extends SdkPopup {
  render() {
    return this.renderPopup((
      <div>
        Welcome to Null Island!

        <button className="sdk-btn" onClick={() => {
          this.close();
        }}>
          Close
        </button>
      </div>
    ));
  }
}

/** Handy all around function for adding a random
 *  set of points to the map.
 *  @param {string} sourceName The name of the source to add to.
 *  @param {number} n_points Number of random points to add.
 */
function addPoints(sourceName, n_points = 10) {
  for (let i = 0; i < n_points; i++) {
    // the feature is a normal GeoJSON feature definition
    store.dispatch(mapActions.addFeatures(sourceName, [{
      type: 'Feature',
      properties: {
        id: `point${i}`,
        title: 'Random Point',
      },
      geometry: {
        type: 'Point',
        // this generates a point somewhere on the planet, unbounded.
        coordinates: [(Math.random() * 360) - 180, (Math.random() * 180) - 90],
      },
    }]));
  }
}

function main() {
  // Start with a reasonable global view of the map.
  store.dispatch(mapActions.setView([-15, 30], 2));

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
    type: 'raster',
  }));

  // Add a geojson source to the map.
  store.dispatch(mapActions.addSource('points', {
    type: 'geojson',
    data: {},
  }));

  // add a layer for the random points
  store.dispatch(mapActions.addLayer({
    id: 'random-points',
    source: 'points',
    type: 'circle',
    paint: {
      'circle-radius': 5,
      'circle-color': '#756bb1',
      'circle-stroke-color': '#756bb1',
    },
    // filter out any feature which is "marked."
    filter: ['!=', 'isMarked', true],
  }));

  // add a layer to render marked points
  store.dispatch(mapActions.addLayer({
    id: 'marked-points',
    source: 'points',
    type: 'circle',
    paint: {
      'circle-radius': 5,
      'circle-color': '#fc9272',
      'circle-stroke-color': '#de2d26',
    },
    // only show features which are "marked" in this layer.
    filter: ['==', 'isMarked', true],
  }));

  // Add 100 random points to the map
  addPoints('points', 100);

  ReactDOM.render((
    <Provider store={store}>
      <SdkMap
        style={{position: 'relative'}}
        initialPopups={[<NullIslandPopup coordinate={[0, 0]} closeable={false} />]}
        includeFeaturesOnClick
        onClick={(map, xy, featuresPromise) => {
          featuresPromise.then((featureGroups) => {
            // setup an array for all the features returned in the promise.
            let features = [];

            // featureGroups is an array of objects. The key of each object
            // is a layer from the map.
            for (let g = 0, gg = featureGroups.length; g < gg; g++) {
              // collect every feature from each layer.
              const layers = Object.keys(featureGroups[g]);
              for (let l = 0, ll = layers.length; l < ll; l++) {
                const layer = layers[l];
                features = features.concat(featureGroups[g][layer]);
              }
            }

            if (features.length === 0) {
              // no features, :( Let the user know nothing was there.
              map.addPopup(<SdkPopup coordinate={xy} closeable><i>No features found.</i></SdkPopup>);
            } else {
              // Show the super advanced fun popup!
              map.addPopup(<MarkFeaturesPopup coordinate={xy} features={features} closeable />);
            }
          });
        }}
      >
        <SdkZoomControl style={{position: 'absolute', top: 20, left: 20}} />
      </SdkMap>
    </Provider>
  ), document.getElementById('map'));
}

main();
