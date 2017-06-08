import {LAYER} from '../actions/ActionTypes';

export default function mapSource(state = [], action) {
  switch (action.type) {
    case LAYER.ADD:
      return {
        ...state,
        layer: action.layer
      };

    default:
      return state;
  }
}
