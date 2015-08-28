/* global ol */
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
  clear: (layer, cmp, filter) => {
    AppDispatcher.handleAction({
      type: SelectConstants.CLEAR,
      layer: layer,
      cmp: cmp,
      filter: filter
    });
  },
  selectFeaturesInCurrentSelection: (layer, features, cmp) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURES_IN,
      layer: layer,
      features: features,
      cmp: cmp
    });
  },
  selectFeatures: (layer, features, cmp, clear) => {
    AppDispatcher.handleAction({
      type: SelectConstants.SELECT_FEATURES,
      layer: layer,
      features: features,
      cmp: cmp,
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
