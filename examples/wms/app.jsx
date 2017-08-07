/** WMS Example.
 *
 *  Shows how to interact with a Web Mapping Service.
 *
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import React from 'react';
import ReactDOM from 'react-dom';
import WMSCapabilitiesFormat from 'ol/format/wmscapabilities';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

import '@boundlessgeo/sdk/stylesheet/sdk.scss';
import WMSPopup from './wmspopup';
import LayerList from './layerlist';
import AddWMSLayer from './addwmslayer';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

function main() {
  // start in the middle of america
  store.dispatch(mapActions.setView([-98, 40], 4));

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
  store.dispatch(mapActions.addLayer({
    id: 'osm',
    source: 'osm',
  }));

  // set the background color.
  store.dispatch(mapActions.addLayer({
    id: 'background',
    type: 'background',
    paint: {
      'background-color': '#eee',
    },
  }));

  // retrieve GetCapabilities and give user ability to add a layer.
  const addWMS = () => {
    // this requires CORS headers on the geoserver instance.
    const url = 'https://demo.boundlessgeo.com/geoserver/wms?service=WMS&request=GetCapabilities';
    fetch(url).then(
      response => response.text(),
      error => console.error('An error occured.', error),
    )
    .then((xml) => {
      const info = new WMSCapabilitiesFormat().read(xml);
      const root = info.Capability.Layer;
      ReactDOM.render(<AddWMSLayer
        onAddLayer={(layer) => {
          // add a new source and layer
          const getMapUrl = `https://demo.boundlessgeo.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=${layer.Name}&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
          store.dispatch(mapActions.addSource(layer.Name, {
            type: 'raster',
            tileSize: 256,
            tiles: [getMapUrl],
          }));
          store.dispatch(mapActions.addLayer({
            metadata: {
              'bnd:title': layer.Title,
              'bnd:queryable': layer.queryable,
            },
            id: layer.Name,
            source: layer.Name,
          }));
        }
      }
        layers={root.Layer}
      />, document.getElementById('add-wms'));
    });
  };

  // place the map on the page.
  ReactDOM.render(<SdkMap
    onClick={(map, xy) => {
      // show a popup containing WMS GetFeatureInfo.
      const state = store.getState();
      const view = map.map.getView();
      const layers = state.map.layers;
      for (let i = 0, ii = layers.length; i < ii; ++i) {
        if (layers[i].metadata['bnd:queryable']) {
          const url = map.sources[layers[i].source].getGetFeatureInfoUrl(
            xy.xy, view.getResolution(), view.getProjection(), {
              INFO_FORMAT: 'application/json',
            },
          );
          fetch(url).then(
            response => response.json(),
            error => console.error('An error occured.', error),
          )
          .then((json) => {
            if (json.features.length > 0) {
              map.addPopup(<WMSPopup
                coordinate={xy}
                closeable
                feature={json.features[0]}
              />);
            }
          });
        }
      }
    }}
    store={store}
  />, document.getElementById('map'));

  // add some buttons to demo some actions.
  ReactDOM.render((
    <div>
      <h4>Layers</h4>
      <LayerList store={store} />
      <button onClick={addWMS}>Add WMS Layer</button>
    </div>
  ), document.getElementById('controls'));
}

main();
