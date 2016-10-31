/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* global document */

import {EventEmitter} from 'events';
import ol from 'openlayers';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerConstants from '../constants/LayerConstants.js';

let config = {
  layers: []
};

class LayerStore extends EventEmitter {
  bindMap(map) {
    if (map !== this._map) {
      this._map = map;
      config.layers = this._map.getLayers().getArray();
      for (var i = 0, ii = config.layers.length; i < ii; ++i) {
        this._bindLayer(config.layers[i]);
      }
      this.emitChange();
      this._map.getLayers().on('add', this._onAdd, this);
      this._map.getLayers().on('remove', this._onRemove, this);
    }
  }
  _bindLayer(layer) {
    // TODO should we listen to more generic change event?
    layer.on('change:wfsInfo', this.emitChange, this);
    layer.on('change:styleName', this.emitChange, this);
    layer.on('change:visible', this.emitChange, this);
    if (!(layer instanceof ol.layer.Group)) {
      var source = layer.getSource();
      if (source instanceof ol.source.Tile) {
        source.on('tileloaderror', this._onError, this);
      } else if (source instanceof ol.source.Image) {
        source.on('imageloaderror', this._onError, this);
      }
    } else {
      // change:layers on layer does not seem to work
      layer.getLayers().on('change:length', this.emitChange, this);
    }
  }
  _onError() {
    this.emit('ERROR');
  }
  _onAdd(evt) {
    this._bindLayer(evt.element);
    this.emitChange();
  }
  _onRemove(evt) {
    this.emitChange();
  }
  _flattenForEach(layer, layers) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function(groupLayer) {
        this._flattenForEach(groupLayer, layers);
      }, this);
    } else {
      layers.push(layer);
    }
  }
  _forEachLayer(layer, layers, id) {
    if (layer.get('id') === id) {
      layers.push(layer);
    } else {
      if (layer instanceof ol.layer.Group) {
        layer.getLayers().forEach(function(groupLayer) {
          this._forEachLayer(groupLayer, layers, id);
        }, this);
      }
    }
  }
  findLayer(id) {
    var layers = [];
    this._forEachLayer(this._map.getLayerGroup(), layers, id);
    if (layers.length === 1) {
      return layers[0];
    } else {
      return undefined;
    }
  }
  getMap() {
    return this._map;
  }
  getState() {
    config.flatLayers = [];
    this._flattenForEach(this._map.getLayerGroup(), config.flatLayers);
    return config;
  }
  emitChange() {
    this.emit('CHANGE');
  }
  addChangeListener(cb) {
    this.on('CHANGE', cb);
  }
  addErrorListener(cb) {
    this.on('ERROR', cb);
  }
  removeChangeListener(cb) {
    this.removeListener('CHANGE', cb);
  }
  removeErrorListener(cb) {
    this.removeListener('ERROR', cb);
  }
}

let _LayerStore = new LayerStore();

export default _LayerStore;

AppDispatcher.register((payload) => {
  let action = payload.action;
  let layers, layerArray;
  switch (action.type) {
    case LayerConstants.REMOVE_LAYER:
      layers = _LayerStore.getMap().getLayers();
      layers.remove(action.layer);
      break;
    case LayerConstants.MOVE_LAYER:
      if (action.group) {
        layers = action.group.getLayers();
      } else {
        layers = _LayerStore.getMap().getLayers();
      }
      layerArray = layers.getArray();
      var layer2 = layerArray[action.hoverIndex - 1];
      if (action.dragIndex < action.hoverIndex) {
        layers.remove(action.layer);
        layers.insertAt(action.dragIndex, action.layer);
      } else {
        layers.remove(layer2);
        layers.insertAt(action.hoverIndex, layer2);
      }
      break;
    default:
      break;
  }
});
