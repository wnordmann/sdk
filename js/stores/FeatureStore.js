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
  bindLayer(layer) {
    this._config = {};
    this._layer = layer;
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    source.on('change', function(evt) {
      if (evt.target.getState() === 'ready') {
        this._config.features = evt.target.getFeatures();
        delete this._schema;
        this.emitChange();
      }
    }, this);
    this._config.features = source.getFeatures();
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
  getSchema() {
    if (!this._schema && this._config.features.length > 0) {
      var schema = {};
      var feature = this._config.features[0];
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
