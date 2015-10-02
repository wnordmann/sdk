/* global document */

import {EventEmitter} from 'events';
import ol from 'openlayers';
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
  addLayer(layer, filter) {
    var id = layer.get('id');
    if (!this._layers[id]) {
      this._layers[id] = layer;
      this.bindLayer(layer);
    }
    if (filter === true) {
      this.setSelectedAsFilter(layer);
    } else {
      this.emitChange();
    }
  }
  _setFeatures(layer, features) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    if (!this._config[id].selected) {
      this._config[id].selected = [];
    }
    this._config[id].features = features;
    this._config[id].originalFeatures = features.slice();
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
  clearSelection(layer, filter) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    this._config[id].selected = [];
    if (filter === true) {
      this.setSelectedAsFilter(layer);
    } else {
      this.emitChange();
    }
  }
  selectFeaturesInCurrentSelection(layer, features) {
    var id = layer.get('id'), i, ii;
    var selected = this._config[id].selected;
    var remove = [];
    for (i = 0, ii = selected.length; i < ii; ++i) {
      if (features.indexOf(selected[i]) === -1) {
        remove.push(selected[i]);
      }
    }
    for (i = 0, ii = remove.length; i < ii; ++i) {
      var idx = selected.indexOf(remove[i]);
      if (idx > -1) {
        selected.splice(idx, 1);
      }
    }
    this.emitChange();
  }
  toggleFeature(layer, feature) {
    var id = layer.get('id'), idx = this._config[id].selected.indexOf(feature);
    if (idx === -1) {
      this._config[id].selected.push(feature);
    } else {
      this._config[id].selected.splice(idx, 1);
    }
    this.emitChange();
  }
  setSelection(layer, features, clear) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    var filter = this._config[id].selected === this._config[id].features;
    if (clear === true) {
      this._config[id].selected = features;
      if (filter === true) {
        this._config[id].features = features;
      }
    } else {
      for (var i = 0, ii = features.length; i < ii; ++i) {
        if (this._config[id].selected.indexOf(features[i]) === -1) {
          this._config[id].selected.push(features[i]);
        }
      }
    }
    this.emitChange();
  }
  setSelectedAsFilter(layer) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    this._config[id].features = this._config[id].selected;
    this.emitChange();
  }
  restoreOriginalFeatures(layer) {
    var id = layer.get('id');
    this._config[id].features = this._config[id].originalFeatures;
    this.emitChange();
  }
  getSchema(layer) {
    var id = layer.get('id');
    if (!this._schema[id] && this._config[id] && this._config[id].originalFeatures.length > 0) {
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
    if (layer) {
      return this._config[layer.get('id')];
    } else {
      return this._config;
    }
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
    case SelectConstants.SELECT_FEATURES_IN:
      _FeatureStore.selectFeaturesInCurrentSelection(action.layer, action.features);
      break;
    case SelectConstants.CLEAR:
      _FeatureStore.clearSelection(action.layer, action.filter);
      break;
    case SelectConstants.SELECT_FEATURES:
      _FeatureStore.setSelection(action.layer, action.features, action.clear);
      break;
    case SelectConstants.TOGGLE_FEATURE:
      _FeatureStore.toggleFeature(action.layer, action.feature);
      break;
    default:
      break;
  }
});

export default _FeatureStore;
