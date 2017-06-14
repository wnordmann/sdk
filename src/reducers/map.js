import {MAP} from '../actions/ActionTypes';

const defaultState = {
  view: {
    center:[0,0],
    zoom: 0,
    rotation: 0,
    resolution: undefined
  }
}
export default (state = defaultState, action) => {
  switch (action.type) {
    case  MAP.GET_CONFIG:
      return action.mapState;
    case  MAP.SET_VIEW2:
      const new_view = {};
      for (const key of ['center', 'zoom', 'resolution']) {
        if (typeof (action[key]) !== 'undefined') {
          new_view[key] = action[key];
        }
      }
      return {
        ...state,
        view:{
          ...state.view,
          center:action.center,
          zoom:action.zoom,
          resolution: action.resolution
        }
      };
      //Object.assign({}, state, new_view);
    case  MAP.SET_VIEW:
      return {
        ...state,
        view:{
          ...state.view,
          center:action.center,
          zoom:action.zoom
        }
      };
    case  MAP.SET_RESOLUTION:
      return {
        ...state,
        view:{
          ...state.view,
          resolution:action.resolution
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
          rotation: action.rotation,
        }
      }
    default:
      return state
  }
}
