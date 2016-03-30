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

import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import LayerStore from '../stores/LayerStore.js';
import pureRender from 'pure-render-decorator';
import './LayerSelector.css';

/**
 * A combobox to select a layer.
 */
@pureRender
export default class LayerSelector extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      layers: []
    };
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }
  componentDidMount() {
    var select = ReactDOM.findDOMNode(this.refs.layerSelect);
    var layer = LayerStore.findLayer(select.value);
    if (layer) {
      this.props.onChange.call(this, layer);
    }
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  getLayer() {
    var select = ReactDOM.findDOMNode(this.refs.layerSelect);
    if (select) {
      return LayerStore.findLayer(select.value);
    }
  }
  _onChange() {
    var flatLayers = LayerStore.getState().flatLayers;
    var layers = [];
    for (var i = 0, ii = flatLayers.length; i < ii; ++i) {
      var lyr = flatLayers[i];
      if (!this.props.filter || this.props.filter(lyr) === true) {
        layers.push(lyr);
      }
    }
    this.setState({layers: layers});
  }
  _onItemChange(evt) {
    var layer = LayerStore.findLayer(evt.target.value);
    this.props.onChange.call(this, layer);
  }
  render() {
    var selectItems = this.state.layers.map(function(lyr, idx) {
      var title = lyr.get('title'), id = lyr.get('id');
      return (
        <option value={id} key={idx}>{title}</option>
      );
    });
    return (
      <select ref='layerSelect' defaultValue={this.props.value} className='form-control' onChange={this._onItemChange.bind(this)}>
        {selectItems}
      </select>
    );
  }
}

LayerSelector.propTypes = {
  /**
   * The map from which to extract the layers.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * A filter function to filter out some of the layers by returning false.
   */
  filter: React.PropTypes.func,
  /**
   * The default value of the layer selector, i.e. the layer to select by default.
   */
  value: React.PropTypes.string,
  /**
   * Change callback function.
   */
  onChange: React.PropTypes.func.isRequired
};
