import {MAP} from '../actions/ActionTypes';
export default (state = [], action) => {
  switch (action.type) {
    case  MAP.GET_CONFIG:
      return action.mapState;
    case  MAP.SET_VIEW:
      return {
        ...state,
        view:{
          ...state.view,
          center:action.center,
          zoom:action.zoom,
          resolution:action.resolution
        }
      };


    default:
      return state
  }
}
