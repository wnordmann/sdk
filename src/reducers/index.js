import {combineReducers} from 'redux';
import bookmarks from './bookmarks';
import geocoding from './geocoding';
import layers from './layers';
import mapPanel from './mapPanel';
import zoom from './zoom';
import zoomSlider from './zoomSlider';
import zoomToLatLon from './zoomToLatLon';

const reducer = combineReducers({
  bookmarks,
  geocoding,
  layers,
  mapPanel,
  zoom,
  zoomSlider,
  zoomToLatLon
})

export default reducer
