export const addLayer = (map, layer, index) => {
  return {
    type: 'ADD_LAYER',
    map: map,
    layer: layer,
    index: index
  };
};

export const removeLayer = (map, layer) => {
  return {
    type: 'REMOVE_LAYER',
    map: map,
    layer: layer
  };
};
