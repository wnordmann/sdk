import {MAP} from '../actions/ActionTypes';

const defaultState = {view: {}}

export default (state = defaultState, action) => {
  switch (action.type) {
    case  MAP.GET_CONFIG:
      return action.mapState;
    case  MAP.SET_VIEW:
      const new_view = state.view;
      for (const key of ['center', 'zoom', 'resolution', 'rotation']) {
        if (typeof (action.view[key]) !== 'undefined') {
          new_view[key] = action.view[key];
        }
      }
      return {
        ...state,
        view: {
          ...new_view
        }
      };
    case MAP.SET_ROTATION:
      return {
        ...state,
        view: {
          ...state.view,
          rotation: action.rotation
        }
      }
    default:
      return state
  }
}
