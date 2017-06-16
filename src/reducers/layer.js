import {LAYER} from '../actions/ActionTypes';

export default function mapSource(state = [], action) {
  switch (action.type) {
    case LAYER.ADD:
      return {
        ...state,
        layer: action.layer
      };
    // case LAYER.MOVELAYER:
    //   console.log(state.mapState.layers);
    //   // return {
    //   //   ...state,
    //   //   layer: action.layer
    //   // };
    //   return state;
    default:
      return state;
  }
}
