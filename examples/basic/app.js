/** Very basic SDK application example.
 *
 *  Contains a Map and demonstrates some of the dynamics of
 *  using the store.
 *
 */

import { createStore, combineReducers } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom'

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

window.store = store;

function main() {

  // start in the middle of america
  store.dispatch(mapActions.setView([-10895923.706980927, 4656189.67701237], 4));

  // add the OSM source
  store.dispatch(mapActions.addSource('osm', {
    type: 'raster',
    tileSize: 256,
    tiles: [
      "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ]
  }));

  // and an OSM layer.
  store.dispatch(mapActions.addLayer({
    id: 'osm',
    source: 'osm',
  }));

  // semaphore to prevent the states layer
  //  from being added twice.
  let sem = true;
  const addLayer = () => {
    if(sem) {
      store.dispatch(mapActions.addSource('states', {
        type: 'raster',
        tileSize: 256,
        tiles: ["https://ahocevar.com/geoserver/gwc/service/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&SRS=EPSG:900913&LAYERS=topp:states&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"]
      }));

      store.dispatch(mapActions.addLayer({
        id: 'states',
        source: 'states'
      }));

      sem = false;
    }

  }

  const toggleVisibility = (vis) => {
    store.dispatch(mapActions.setLayerVisibility('osm', vis));
  }

  const showOSM = () => {
    toggleVisibility('visible');
  }

  const hideOSM = () => {
    toggleVisibility('none');
  }

  // This doesn't do anything particularly impressive
  // other than recenter the map on null-island.
  const zoomToNullIsland = () => {
    store.dispatch(mapActions.setView([0,0], 5));
  }

  // place the map on the page.
  ReactDOM.render(<SdkMap store={store} />, document.getElementById('map'));

  // add some buttons to demo some actions.
  ReactDOM.render((
    <div>
      <button onClick={ addLayer }>Add Layer</button>
      <button onClick={ hideOSM }>Hide OSM</button>
      <button onClick={ showOSM }>Show OSM</button>
      <button onClick={ zoomToNullIsland }>Zoom to Null Island</button>
    </div>
  ), document.getElementById('controls'));
}

main();
