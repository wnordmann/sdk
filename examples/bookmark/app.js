/** Demo of bookmarks zooming between points in an SDK map.
 *  Custom Open Layer Controls are added
 *
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

import SdkMapControl from '@boundlessgeo/sdk/components/map/mapControl';

// This will have webpack include all of the SDK styles.
import '@boundlessgeo/sdk/stylesheet/sdk.scss';

class BookmarkComponent extends SdkMapControl{
  moveNext(map){
    map.addMapControl();
  }
  render() {
    const feature = this.props.feature
    return this.renderMapControl((
      <div className='modal-window'>
        <div className='interior'>
          <header>{feature.properties.title}</header>
            Name: {feature.properties.randomName} <br/>
          Latitude: <span className='coords'>{feature.geometry.coordinates[1]}</span> <br/>
            Longitude: <span className='coords'>{feature.geometry.coordinates[0]}</span> <br/>
          <button  onClick={() => { console.log('points');}}  >Previous</button><button>Next</button>
        </div>
      </div>
    ))
  }
}

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

function main() {
  // Start with a reasonable global view of the map.
  store.dispatch(mapActions.setView([-93, 45], 5));
  var count = 0;
  var feature = {};
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

  // 'geojson' sources allow rendering a vector layer
  // with all the features stored as GeoJSON. "data" can
  // be an individual Feature or a FeatureCollection.
  store.dispatch(mapActions.addSource('points', {
    type: 'geojson',
    clusterRadius: 50,
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  }));

  // Setup a layer to render the features as clustered.
  store.dispatch(mapActions.addLayer({
    id: 'clustered-points',
    source: 'points',
    type: 'circle',
    paint: {
      'circle-radius': {
        type: 'interval',
        default: 3,
        property: 'point_count',
        stops: [
          // stops are defined as the "min property value", style value,
          // In this example points with >= 2 but < 5 points will
          //  be rendered with a 8 px radius
          [0, 5], [2, 8], [5, 13], [10, 21],
        ],
      },
      'circle-color': '#feb24c',
      'circle-stroke-color': '#f03b20',
    },
    filter: ['has', 'point_count'],
  }));

  store.dispatch(mapActions.addLayer({
    id: 'clustered-labels',
    source: 'points',
    layout: {
      'text-field': '{point_count}',
      'text-font': ['Arial'],
      'text-size': 10,
    },
    filter: ['has', 'point_count'],
  }));

  // Show the unclustered points in a different colour.
  store.dispatch(mapActions.addLayer({
    id: 'random-points',
    source: 'points',
    type: 'circle',
    paint: {
      'circle-radius': 3,
      'circle-color': '#756bb1',
      'circle-stroke-color': '#756bb1',
    },
    filter: ['!has', 'point_count'],
  }));

  // Add a random point to the map
  const addRandomPoints = (nPoints = 20) => {
    // Random names to give the points more content
    // http://listofrandomnames.com/
    const randomNames = [
      'Riva Ristau',  
      'Reena Rodgers',  
      'Brent Borgia', 
      'Annemarie Asher',  
      'Solomon Salgado',  
      'Tatiana Treece',  
      'Philomena Paradise',  
      'Adelle Audie',  
      'Janean Jordahl',  
      'Celine Cataldo',  
      'Faustino Fournier',  
      'Carlo Convery',  
      'Carla Ciriaco',  
      'Florance Farnham',  
      'Jeraldine Jaycox',  
      'Albina Auclair',  
      'Breanne Blind',  
      'Carmina Croney',  
      'Mila Mero',
      'Lorita Laux'
      ]
    // loop over adding a point to the map.
    for (let i = 0; i < nPoints; i++) {
      // the feature is a normal GeoJSON feature definition,
      // 'points' referes to the SOURCE which will get the feature.
      store.dispatch(mapActions.addFeatures('points', [{
        type: 'Feature',
        properties: {
          title: 'Random Point',
          isRandom: true,
          randomName: randomNames[Math.round(Math.random(20) * 100) % 20]
        },
        geometry: {
          type: 'Point',
          // this generates a point somewhere on the planet, unbounded.
          coordinates: [(Math.random() * 360) - 180, (Math.random() * 180) - 90],
        },
      }]));
    }
  };

  // Zoom to next point to the map
  const zoomToNextPoint = (sourceName) => {
    // get list of features from state
    const features = store.getState().map.sources[sourceName].data.features;

    // get coordinates for current feature
    const coords = features[count].geometry.coordinates;

    // Change zoom to coordinates of current feature
    store.dispatch(mapActions.setView(coords, 5));

    // Update count, this
    count = features.length - 1 === count ? 0 : count + 1;
    // map.addMapControl(<BookmarkComponent feature={features[count]}/>)
  };

  // add 10 random points to the map on startup
  addRandomPoints(10);

  // place the map on the page
  const features = store.getState().map.sources["points"].data.features;

  ReactDOM.render(<SdkMap store={store} initialMapControls={[<BookmarkComponent feature={features[count]}/>]}/>, document.getElementById('map'));

  // add some buttons to demo some actions.
  ReactDOM.render((
    <div>
      <button className="sdk-btn" onClick={() => { zoomToNextPoint('points'); }}>Zoom to the next point</button>
    </div>
  ), document.getElementById('controls'));
}

main();
