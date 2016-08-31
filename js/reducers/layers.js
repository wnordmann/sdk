const layers = (state = {layers: []}, action) => {
  switch (action.type) {
    case 'ADD_LAYER':
      return {layers: state.layers.slice(0, action.index).concat(action.layer, state.layers.slice(action.index))};
    case 'REMOVE_LAYER':
      var idx = state.layers.indexOf(action.layer);
      return {layers: state.layers.slice(0, idx).concat(state.layers.slice(idx + 1))};
    default:
      return state;
  }
};

export default layers;
