import {combineReducers} from 'redux';
import geocoding from './geocoding';
import bookmarks from './bookmarks';

const reducer = combineReducers({
  geocoding,
  bookmarks
})

export default reducer
