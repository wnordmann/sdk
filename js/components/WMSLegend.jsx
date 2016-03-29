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
import url from 'url';
import pureRender from 'pure-render-decorator';

/**
 * Legend component for layers with a WMS source (tiled or untiled).
 */
@pureRender
class WMSLegend extends React.Component {
  render() {
    var layer = this.props.layer;
    var source = layer.getSource();
    var params = source.getParams();
    var wmsUrl = source.getUrls()[0];
    var urlObj = url.parse(wmsUrl);
    var options = '';
    for (var key in this.props.options) {
      options += key + ':' + this.props.options[key] + ';';
    }
    options = options.slice(0, -1);
    // TODO split up LAYERS param if needed
    urlObj.query  = {
      service: 'WMS',
      request: 'GetLegendGraphic',
      transparent: true,
      format: this.props.format,
      height: this.props.height,
      width: this.props.width,
      legend_options: options,
      layer: params.LAYERS,
      style: params.STYLES ? params.STYLES : ''
    };
    var legendUrl = url.format(urlObj);
    return (<img src={legendUrl} />);
  }
}

WMSLegend.propTypes = {
  /**
   * The layer that has a WMS source.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Layer).isRequired,
  /**
   * The height in pixels of the WMS GetLegendGraphic call.
   */
  height: React.PropTypes.number,
  /**
   * The width in pixels of the WMS GetLegendGraphic call.
   */
  width: React.PropTypes.number,
  /**
   * Options to send as LEGEND_OPTIONS parameter.
   */
  options: React.PropTypes.object,
  /**
   * The format to use for the WMS GetLegendGraphic call.
   */
  format: React.PropTypes.string
};

WMSLegend.defaultProps = {
  height: 20,
  width: 20,
  options: {
    fontAntiAliasing: true,
    fontSize: 11,
    fontName: 'Arial'
  },
  format: 'image/png'
};

export default WMSLegend;
