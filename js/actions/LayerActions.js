import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import ol from 'openlayers';

export default {
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
