import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import ol from 'openlayers';

export default {
  activateTool: (tool, toggleGroup) => {
    AppDispatcher.handleAction({
      type: MapConstants.ACTIVATE_TOOL,
      tool: tool,
      toggleGroup: toggleGroup
    });
  },
  setBaseLayer: (baseLayer, map) => {
    var forEachLayer = function(layers, layer) {
      if (layer instanceof ol.layer.Group) {
        layer.getLayers().forEach(function(groupLayer) {
          forEachLayer(layers, groupLayer);
        });
      } else if (layer.get('type') === 'base') {
        layers.push(layer);
      }
    };
    var baseLayers = [];
    forEachLayer(baseLayers, map.getLayerGroup());
    for (var i = 0, ii = baseLayers.length; i < ii; ++i) {
      baseLayers[i].setVisible(false);
    }
    baseLayer.setVisible(true);
  },
  setVisible: (layer, visible) => {
    layer.setVisible(visible);
    AppDispatcher.handleAction({
      type: MapConstants.CHANGE_VISIBILITY,
      layer: layer,
      visible: visible
    });
  },
  selectLayer: (layer, cmp) => {
    AppDispatcher.handleAction({
      type: MapConstants.SELECT_LAYER,
      layer: layer,
      cmp: cmp
    });
  },
  removeLayer: (layer) => {
    AppDispatcher.handleAction({
      type: MapConstants.REMOVE_LAYER,
      layer: layer
    });
  },
  moveLayerDown: (layer) => {
    AppDispatcher.handleAction({
      type: MapConstants.MOVE_LAYER_DOWN,
      layer: layer
    });
  },
  moveLayerUp: (layer) => {
    AppDispatcher.handleAction({
      type: MapConstants.MOVE_LAYER_UP,
      layer: layer
    });
  }
};
