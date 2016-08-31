var flattenLayers = (map, layer, layers) => {
  var flattenForEach = function(layer, layers) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function(groupLayer) {
        flattenForEach(groupLayer, layers);
      }, this);
    } else {
      layers.push(layer);
    }
  };
  var flatLayers = [];
  flattenForEach(map.getLayerGroup(), flatLayers);
  return flatLayers;
};

const layers = (state = {layers: []}, action) => {
  var layers, flatLayers;
  switch (action.type) {
    case 'ADD_LAYER':
      layers = state.layers.slice(0, action.index).concat(action.layer, state.layers.slice(action.index));
      flatLayers = flattenLayers(action.map, action.layer, layers);
      return {layers: layers, flatLayers: flatLayers};
    case 'REMOVE_LAYER':
      var idx = state.layers.indexOf(action.layer);
      layers = state.layers.slice(0, idx).concat(state.layers.slice(idx + 1));
      flatLayers = flattenLayers(action.map, action.layer, layers);
      return {layers: layers, flatLayers: flatLayers};
    default:
      return state;
  }
};

export default layers;
