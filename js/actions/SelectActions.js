/* global ol */
import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  selectFeatures: (layer, features) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURES,
      layer: layer,
      features: features
    });
  },
  selectFeature: (layer, feature) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURE,
      layer: layer,
      feature: feature
    });
  },
  unselectFeature: (layer, feature) => {
    AppDispatcher.handleAction({
      type: SelectConstants.UNSELECT_FEATURE,
      layer: layer,
      feature: feature
    });
  }
};
