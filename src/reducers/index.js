import {combineReducers} from 'redux';
import bookmarks from './bookmarks';
import geocoding from './geocoding';
import mapPanel from './mapPanel';
import zoom from './zoom';
import zoomSlider from './zoomSlider';

const reducer = combineReducers({
  bookmarks,
  geocoding,
  mapPanel,
  zoom,
  zoomSlider
})

export default reducer
