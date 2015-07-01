/* global document */

import {EventEmitter} from 'events';

export default class FeatureStore extends EventEmitter {
  constructor(props) {
    super();
    if (props.layer) {
      this.bindLayer(props.layer);
    }
  }
  bindLayer(layer) {
    this._config = {};
    this._layer = layer;
    var source = layer.getSource();
    source.on('change', function(evt) {
      if (evt.target.getState() === 'ready') {
        this._config.features = evt.target.getFeatures();
        this.emitChange();
      }
    }, this);
    this._config.features = source.getFeatures();
    this.emitChange();
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
