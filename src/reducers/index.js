import {combineReducers} from 'redux';
import geocoding from './geocoding';
import bookmarks from './bookmarks';
import mapPanel from './map_panel';

const reducer = combineReducers({
  geocoding,
  bookmarks,
  mapPanel
})

export default reducer
