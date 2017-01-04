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
import classNames from 'classnames';
import {ListItem} from 'material-ui/List';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ArcGISRestService from '../services/ArcGISRestService';
import pureRender from 'pure-render-decorator';

/**
 * Legend component for layers with an ArcGISRest source (tiled or untiled).
 *
 * ```xml
 * <ArcGISRestLegend className='legend-list-img' layer={layer} />
 * ```
 */
@pureRender
class ArcGISRestLegend extends React.Component {
  static propTypes = {
    /**
     * The layer that has a WMS source.
     */
    layer: React.PropTypes.instanceOf(ol.layer.Layer).isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  constructor(props, context) {
    super(props);
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme()
    };
  }
  componentDidMount() {
    var layer = this.props.layer;
    var source = layer.getSource();
    var url = source.getUrls()[0];
    var me = this;
    ArcGISRestService.getLegend(url, function(jsonData) {
      if (me._unmounted !== true) {
        me.setState({legendInfo: jsonData});
      }
    });
  }
  componentWillUnmount() {
    this._unmounted = true;
  }
  render() {
    var markup = [];
    if (this.state.legendInfo) {
      var id = this.props.layer.get('name');
      var layers = this.state.legendInfo.layers;
      for (var i = 0, ii = layers.length; i < ii; ++i) {
        if (String(layers[i].layerId) === id) {
          for (var j = 0, jj = layers[i].legend.length; j < jj; ++j) {
            var label = layers[i].legend[j].label;
            markup.push(
<ListItem disabled={true} key={id + '-' + j} primaryText={label} leftIcon={<img style={{width:'auto', height: 'auto'}} src={'data:' + layers[i].legend[j].contentType + ';base64,' + layers[i].legend[j].imageData} />} />
            );
          }
          break;
        }
      }
    }
    return (
      <div className={classNames('sdk-component wms-legend', this.props.className)}>
        {markup}
      </div>
    );
  }
}

export default ArcGISRestLegend;
