import {combineReducers} from 'redux';
import geocoding from './geocoding';
import bookmarks from './bookmarks';
import mapPanel from './mapPanel';
import zoomSlider from './zoomSlider';

const reducer = combineReducers({
  geocoding,
  bookmarks,
  mapPanel,
  zoomSlider
})

export default reducer
