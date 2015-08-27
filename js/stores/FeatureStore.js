/* global ol, document */

import {EventEmitter} from 'events';
import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

class FeatureStore extends EventEmitter {
  constructor() {
    super();
    this._regexes = {
      url: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      file: /.*[\\\\/].*\..*/
    };
    this._layers = {};
    this._schema = {};
    this._config = {};
  }
  addLayer(layer) {
    var id = layer.get('id');
    if (!this._layers[id]) {
      this._layers[id] = layer;
      this.bindLayer(layer);
    }
    this.emitChange();
  }
  getLayer() {
    return this._layer;
  }
  _setFeatures(layer, features) {
    this._config[layer.get('id')] = {
      features: features,
      selected: [],
      originalFeatures: features.slice()
    };
  }
  bindLayer(layer) {
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    source.on('change', function(evt) {
      if (evt.target.getState() === 'ready') {
        var features = evt.target.getFeatures();
        this._setFeatures(layer, features);
        delete this._schema[layer.get('id')];
        this.emitChange();
      }
    }, this);
    this._setFeatures(layer, source.getFeatures());
    delete this._schema[layer.get('id')];
  }
  _determineType(value) {
    var type = 'string';
    if (this._regexes.url.test(value) || this._regexes.file.test(value)) {
      type = 'link';
    }
    return type;
  }
  setSelection(layer, features, clear) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    if (clear === true) {
      this._config[id].selected = features;
    } else {
      for (var i = 0, ii = features.length; i < ii; ++i) {
        if (this._config[id].selected.indexOf(features[i]) === -1) {
          this._config[id].selected.push(features[i]);
        }
      }
    }
    this.emitChange();
  }
  setFilter(layer, features) {
    var id = layer.get('id');
    if (features === null) {
      this._config[id].features = this._config[id].originalFeatures;
    } else {
      if (!this._config[id]) {
        this._config[id] = {};
      }
      this._config[id].features = features;
    }
    this.emitChange();
  }
  getSchema(layer) {
    var id = layer.get('id');
    if (!this._schema[id] && this._config[id].originalFeatures.length > 0) {
      var schema = {};
      var feature = this._config[id].originalFeatures[0];
      var geom = feature.getGeometryName();
      var values = feature.getProperties();
      for (var key in values) {
        if (key !== geom) {
          schema[key] = this._determineType(values[key]);
        }
      }
      this._schema[id] = schema;
    }
    return this._schema[id];
  }
  getObjectAt(layer, index) {
    return this._config[layer.get('id')].features[index].getProperties();
  }
  getState(layer) {
    return this._config[layer.get('id')];
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

let _FeatureStore = new FeatureStore();

AppDispatcher.register((payload) => {
  let action = payload.action;
  switch(action.type) {
    case SelectConstants.SELECT_FEATURES:
      _FeatureStore.setSelection(action.layer, action.features, action.clear);
      break;
    default:
      break;
  }
});

export default _FeatureStore;
