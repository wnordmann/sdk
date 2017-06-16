import {MAP} from '../actions/ActionTypes';

import ol from 'openlayers';

/** Take in the size of the map and extent and
 *   return a new "view" containing center and zoom.
 */

function convertFromExtent(mapSize, extent, rotation) {
  const view = new ol.View();
  view.fit(extent, {
    size: mapSize
  });

  return {
    zoom: view.getZoom(),
    center: view.getCenter(),
    rotation: rotation
  }
}

export default (state = {}, action) => {
  switch (action.type) {
    case  MAP.GET_CONFIG:
      return action.mapState;
    case  MAP.SET_VIEW:
      return {
        ...state,
        view:{
          ...state.view,
          center:action.center,
          zoom:action.zoom
        }
      };
    case MAP.ZOOM_IN:
    //TODO:Check MaxZoom
      return {
        ...state,
        view:{
          ...state.view,
          zoom:state.view.zoom + action.zoomDelta
        }
      }
    case MAP.ZOOM_OUT:
      //TODO:Check MinZoom
      return {
        ...state,
        view:{
          ...state.view,
          zoom:state.view.zoom - action.zoomDelta
        }
      }
    case MAP.SET_ROTATION:
      return {
        ...state,
        view: {
          ...state.view,
          rotation: action.rotation
        }
      }
    case MAP.SET_SIZE:
      return {
        ...state,
        size: action.size
      };
    case MAP.FIT_EXTENT:
      return {
        ...state,
        view: convertFromExtent(state.size, action.extent, state.rotation)
      }
    default:
      return state
  }
}
