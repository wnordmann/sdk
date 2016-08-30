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
