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
  showSearchResult: (results) => {
    AppDispatcher.handleAction({
      type: MapConstants.SEARCH_RESULTS,
      searchResults: results
    });
  },
  zoomToLayer: (layer) => {
    AppDispatcher.handleAction({
      type: MapConstants.ZOOM_TO_LAYER,
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
  },
  downloadLayer: (layer) => {
    var geojson = new ol.format.GeoJSON();
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    var features = source.getFeatures();
    var json = geojson.writeFeatures(features);
    var dl = document.createElement('a');
    dl.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
    dl.setAttribute('download', layer.get('title') + '.geojson');
    dl.click();
    AppDispatcher.handleAction({
      type: MapConstants.DOWNLOAD_LAYER,
      layer: layer
    });
  },
  setOpacity: (layer, opacity) => {
    layer.setOpacity(opacity);
    AppDispatcher.handleAction({
      type: MapConstants.SET_LAYER_OPACITY,
      layer: layer,
      opacity: opacity
    });
  }
};
