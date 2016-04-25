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
import ol from 'openlayers';
import LayerStore from '../stores/LayerStore.js';
import pureRender from 'pure-render-decorator';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './LayerSelector.css';

const messages = defineMessages({
  emptytext: {
    id: 'layerselector.emptytext',
    description: 'Empty text for layer selector',
    defaultMessage: 'Select a layer'
  },
  labeltext: {
    id: 'layerselector.labeltext',
    description: 'Label for combo',
    defaultMessage: 'Layer'
  }
});

/**
 * A combobox to select a layer.
 */
@pureRender
class LayerSelector extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      layers: [],
      value: this.props.value
    };
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }
  componentDidMount() {
    if (this.state.value) {
      var layer = LayerStore.findLayer(this.state.value);
      if (layer) {
        this.props.onChange.call(this, layer);
      }
    }
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  getLayer() {
    if (this.state.value !== null) {
      return LayerStore.findLayer(this.state.value);
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
    if (layers.length > 0) {
      this.setState({layers: layers, value: layers[0].get('id')});
      this.props.onChange.call(this, layers[0]);
    } else {
      this.setState({layers: layers});
    }
  }
  _onItemChange(evt, index, value) {
    var layer = LayerStore.findLayer(value);
    this.props.onChange.call(this, layer);
    this.setState({value: value});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var selectItems = this.state.layers.map(function(lyr, idx) {
      var title = lyr.get('title'), id = lyr.get('id');
      return (
        <MenuItem key={id} value={id} label={title} primaryText={title} />
      );
    });
    return (
      <SelectField floatingLabelText={formatMessage(messages.labeltext)} hintText={formatMessage(messages.emptytext)} value={this.state.value} onChange={this._onItemChange.bind(this)}>
        {selectItems}
      </SelectField>
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
  onChange: React.PropTypes.func.isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(LayerSelector, {withRef: true});
