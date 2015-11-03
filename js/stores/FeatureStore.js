/* global document */

import {EventEmitter} from 'events';
import ol from 'openlayers';
import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerStore from './LayerStore.js';

class FeatureStore extends EventEmitter {
  constructor() {
    super();
    this._createDefaultSelectStyleFunction = function() {
      var styles = {};
      var width = 3;
      var white = [255, 255, 255, 1];
      var yellow = [255, 255, 0, 1];
      styles.Polygon = [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: [255, 255, 0, 0.5]
          })
        })
      ];
      styles.MultiPolygon = styles.Polygon;
      styles.LineString = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: white,
            width: width + 2
          })
        }),
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: yellow,
            width: width
          })
        })
      ];
      styles.MultiLineString = styles.LineString;
      styles.Circle = styles.Polygon.concat(styles.LineString);
      styles.Point = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: width * 2,
            fill: new ol.style.Fill({
              color: yellow
            }),
            stroke: new ol.style.Stroke({
              color: white,
              width: width / 2
            })
          }),
          zIndex: Infinity
        })
      ];
      styles.MultiPoint = styles.Point;
      styles.GeometryCollection = styles.Polygon.concat(styles.LineString, styles.Point);
      styles.Polygon.push.apply(styles.Polygon, styles.LineString);
      styles.GeometryCollection.push.apply(styles.GeometryCollection, styles.LineString);
      return function(feature, resolution) {
        return styles[feature.getGeometry().getType()];
      };
    };
    this._regexes = {
      url: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      file: /.*[\\\\/].*\..*/
    };
    this._layers = {};
    this._schema = {};
    this._config = {};
    this.addChangeListener(this._updateSelect.bind(this));
  }
  _getLayer(feature) {
    for (var key in this._config) {
      for (var i = 0, ii = this._config[key].features.length; i < ii; ++i) {
        if (this._config[key].features[i] === feature) {
          return this._layers[key];
        }
      }
    }
  }
  bindMap(map) {
    if (this._map !== map) {
      this._map = map;
      var me = this;
      var defaultStyle = this._createDefaultSelectStyleFunction();
      this._select = new ol.interaction.Select({
        style: function(feature, resolution) {
          var layer = me._getLayer(feature);
          var selectedStyle;
          if (layer) {
            selectedStyle = layer.get('selectedStyle');
          }
          if (selectedStyle) {
            if (selectedStyle instanceof ol.style.Style) {
              return [selectedStyle];
            } else if (Array.isArray(selectedStyle)) {
              return selectedStyle;
            } else {
              return selectedStyle.call(this, feature, resolution);
            }
          } else {
            return defaultStyle.call(this, feature, resolution);
          }
        }
      });
      this._handleEvent = this._select.handleEvent;
      this._select.handleEvent = function(mapBrowserEvent) {
        if (me.active === true) {
          return me._handleEvent.call(me._select, mapBrowserEvent);
        } else {
          return true;
        }
      };
      this._map.addInteraction(this._select);
      LayerStore.bindMap(map);
      var layers = LayerStore.getState().flatLayers;
      for (var i = 0, ii = layers.length; i < ii; ++i) {
        if (layers[i] instanceof ol.layer.Vector) {
          this.addLayer(layers[i]);
        }
      }
    }
  }
  setSelectOnClick(active) {
    this.active = active;
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
  _updateSelect() {
    var selectedFeatures = this._select.getFeatures();
    selectedFeatures.clear();
    var state = this._config;
    for (var key in state) {
      for (var i = 0, ii = state[key].selected.length; i < ii; ++i) {
        selectedFeatures.push(state[key].selected[i]);
      }
    }
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
  setFilter(layer, filter) {
    var id = layer.get('id');
    if (!this._config[id]) {
      this._config[id] = {};
    }
    this._config[id].features = filter;
    this.emitChange();
  }
  setSelectedAsFilter(layer) {
    var id = layer.get('id');
    this.setFilter(layer, this._config[id].selected);
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
