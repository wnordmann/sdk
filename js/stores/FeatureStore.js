/* global ol, document */

import {EventEmitter} from 'events';

export default class FeatureStore extends EventEmitter {
  constructor(props) {
    super();
    if (props.layer) {
      this.bindLayer(props.layer);
    }
    this._regexes = {
      url: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      file: /.*[\\\\/].*\..*/
    };
  }
  getLayer() {
    return this._layer;
  }
  _setFeatures(filter, features) {
    if (filter) {
      this._config.features = filter;
      this._config.originalFeatures = features;
    } else {
      this._config.features = features;
      this._config.originalFeatures = this._config.features.slice();
    }
  }
  bindLayer(layer, filter) {
    this._config = {};
    this._layer = layer;
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    source.on('change', function(evt) {
      if (evt.target.getState() === 'ready') {
        var features = evt.target.getFeatures();
        this._setFeatures(filter, features);
        delete this._schema;
        this.emitChange();
      }
    }, this);
    this._setFeatures(filter, source.getFeatures());
    delete this._schema;
    this.emitChange();
  }
  _determineType(value) {
    var type = 'string';
    if (this._regexes.url.test(value) || this._regexes.file.test(value)) {
      type = 'link';
    }
    return type;
  }
  setFilter(features) {
    if (features === null) {
      this._config.features = this._config.originalFeatures;
    } else {
      this._config.features = features;
    }
    this.emitChange();
  }
  getSchema() {
    if (!this._schema && this._config.originalFeatures.length > 0) {
      var schema = {};
      var feature = this._config.originalFeatures[0];
      var geom = feature.getGeometryName();
      var values = feature.getProperties();
      for (var key in values) {
        if (key !== geom) {
          schema[key] = this._determineType(values[key]);
        }
      }
      this._schema = schema;
    }
    return this._schema;
  }
  getObjectAt(index) {
    return this._config.features[index].getProperties();
  }
  getState() {
    return this._config;
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
