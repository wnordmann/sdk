import {combineReducers} from 'redux';
// import bookmarks from './bookmarks';
// import geocoding from './geocoding';
// import layers from './layers';
import mapState from './map';
// import zoomSlider from './zoomSlider';
// import zoomToLatLon from './zoomToLatLon';

// const reducer = combineReducers({
//   bookmarks,
//   geocoding,
//   layers,
//   map,
//   zoom,
//   zoomSlider,
//   zoomToLatLon
// })
const reducer = combineReducers({
  mapState
})

export default reducer
