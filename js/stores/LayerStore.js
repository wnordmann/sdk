'use strict';

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
  switch(action.type) {
    case MapConstants.CHANGE_VISIBILITY:
      action.layer.setVisible(action.visible);
    break;
    case MapConstants.REMOVE_LAYER:
      _LayerStore.getMap().removeLayer(action.layer);
    break;
    default:
    break;
  }
});
