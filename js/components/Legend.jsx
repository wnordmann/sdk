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
import WMSLegend from './WMSLegend.jsx';

/**
 * Legend component that can show legend graphic for multiple layer and source types dynamically.
 */
@pureRender
class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flatLayers: []
    };
    LayerStore.bindMap(this.props.map);
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }
  _onChange() {
    // TODO apply nesting to this component's structure
    var flatLayers = LayerStore.getState().flatLayers.slice();
    this.setState({flatLayers: flatLayers});
  }
  render() {
    var legends = this.state.flatLayers.map(function(layer) {
      var header = (<div>{layer.get('title')}</div>);
      if ((layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS) ||
        (layer instanceof ol.layer.Image && layer.getSource() instanceof ol.source.ImageWMS)) {
        return (<span key={layer.get('id')}>{header}<WMSLegend layer={layer} /></span>);
      }
    });
    return (<div>{legends}</div>);
  }
}

Legend.propTypes = {
  /**
   * The map whose layers should show up in this legend component.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};

export default Legend;
