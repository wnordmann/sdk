/* global ol */
import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  clear: (layer, cmp) => {
    AppDispatcher.handleAction({
      type: SelectConstants.CLEAR,
      layer: layer,
      cmp: cmp
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
