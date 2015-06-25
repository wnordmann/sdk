/* global ol, document */

import {EventEmitter} from 'events';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import MapConstants from '../constants/MapConstants.js';

let config = {
  layers: []
};

class LayerStore extends EventEmitter {
  bindMap(map) {
    this._map = map;
    config.layers = this._map.getLayers().getArray();
    this.emitChange();
    this._map.getLayers().on('add', this.emitChange, this);
    this._map.getLayers().on('remove', this.emitChange, this);
  }
  getMap() {
    return this._map;
  }
  getState() {
    return config;
  }
  emitChange() {
    this.emit('CHANGE');
  }
  addChangeListener(cb) {
    this.on('CHANGE', cb);
  }
  removeChangeListener(cb) {
    this.removeListener('CHANGE', cb);
  }
}

let _LayerStore = new LayerStore();

export default _LayerStore;

AppDispatcher.register((payload) => {
  let action = payload.action;
  let layers, index;
  switch(action.type) {
    case MapConstants.CHANGE_VISIBILITY:
      action.layer.setVisible(action.visible);
    break;
    case MapConstants.MOVE_LAYER_UP:
      layers = _LayerStore.getMap().getLayers();
      index = layers.getArray().indexOf(action.layer);
      if (index < layers.getLength() - 1) {
        var next = layers.item(index + 1);
        layers.removeAt(index);
        layers.setAt(index + 1, action.layer);
        layers.setAt(index, next);
      }
    break;
    case MapConstants.MOVE_LAYER_DOWN:
      layers = _LayerStore.getMap().getLayers();
      index = layers.getArray().indexOf(action.layer);
      if (index > 1) {
        var prev = layers.item(index - 1);
        layers.removeAt(index);
        layers.setAt(index - 1, action.layer);
        layers.setAt(index, prev);
      }
    break;
    case MapConstants.DOWNLOAD_LAYER:
      var geojson = new ol.format.GeoJSON();
      var source = action.layer.getSource();
      if (source instanceof ol.source.Cluster) {
        source = source.getSource();
      }
      var features = source.getFeatures();
      var json = geojson.writeFeatures(features);
      var dl = document.createElement('a');
      dl.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
      dl.setAttribute('download', action.layer.get('title') + '.geojson');
      dl.click();
    break;
    case MapConstants.SET_LAYER_OPACITY:
      action.layer.setOpacity(action.opacity);
    break;
    case MapConstants.ZOOM_TO_LAYER:
      _LayerStore.getMap().getView().fitExtent(
        action.layer.getSource().getExtent(),
        _LayerStore.getMap().getSize()
      );
    break;
    default:
    break;
  }
});
