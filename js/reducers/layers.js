const layers = (state = {layers: []}, action) => {
  switch (action.type) {
    case 'ADD_LAYERS':
      return {layers: state.layers.concat(action.layers)};
    case 'REMOVE_LAYER':
      var idx = state.layers.indexOf(action.layer);
      return {layers: state.layers.slice(0, idx).concat(state.layers.slice(idx + 1))};
    case 'MOVE_LAYER_UP':
      return state;
    case 'MOVE_LAYER_DOWN':
      return state;
    default:
      return state;
  }
};

export default layers;
