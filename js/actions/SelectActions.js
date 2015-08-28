import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  toggleFeature: (layer, feature) => {
    AppDispatcher.handleAction({
      type: SelectConstants.TOGGLE_FEATURE,
      layer: layer,
      feature: feature
    });
  },
  clear: (layer, filter) => {
    AppDispatcher.handleAction({
      type: SelectConstants.CLEAR,
      layer: layer,
      filter: filter
    });
  },
  selectFeaturesInCurrentSelection: (layer, features) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURES_IN,
      layer: layer,
      features: features,
    });
  },
  selectFeatures: (layer, features, clear) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURES,
      layer: layer,
      features: features,
      clear: clear
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
