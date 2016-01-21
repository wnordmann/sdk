import LayerConstants from '../constants/LayerConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  selectLayer: (layer, cmp) => {
    AppDispatcher.handleAction({
      type: LayerConstants.SELECT_LAYER,
      layer: layer,
      cmp: cmp
    });
  },
  removeLayer: (layer) => {
    AppDispatcher.handleAction({
      type: LayerConstants.REMOVE_LAYER,
      layer: layer
    });
  },
  moveLayerDown: (layer) => {
    AppDispatcher.handleAction({
      type: LayerConstants.MOVE_LAYER_DOWN,
      layer: layer
    });
  },
  moveLayerUp: (layer) => {
    AppDispatcher.handleAction({
      type: LayerConstants.MOVE_LAYER_UP,
      layer: layer
    });
  }
};
