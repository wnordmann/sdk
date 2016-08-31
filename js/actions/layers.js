export const addLayers = (layers) => {
  return {
    type: 'ADD_LAYERS',
    layers: layers
  };
};

export const removeLayer = (layer) => {
  return {
    type: 'REMOVE_LAYER',
    layer: layer
  };
};

export const moveLayerUp = (layer, group) => {
  return {
    type: 'MOVE_LAYER_UP',
    layer: layer,
    group: group
  };
};

export const moveLayerDown = (layer, group) => {
  return {
    type: 'MOVE_LAYER_DOWN',
    layer: layer,
    group: group
  };
};
