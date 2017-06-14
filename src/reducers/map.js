import {MAP} from '../actions/ActionTypes';
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
