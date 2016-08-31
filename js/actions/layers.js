export const addLayer = (layer, index) => {
  return {
    type: 'ADD_LAYER',
    layer: layer,
    index: index
  };
};

export const removeLayer = (layer) => {
  return {
    type: 'REMOVE_LAYER',
    layer: layer
  };
};
