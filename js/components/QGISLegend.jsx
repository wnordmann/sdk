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
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import LayerStore from '../stores/LayerStore.js';
import './QGISLegend.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontitle: {
    id: 'qgislegend.buttontitle',
    description: 'Title to display on hover of the QGIS legend button',
    defaultMessage: 'Legend'
  }
});

/**
 * A component that shows a legend based on artefacts created by the QGIS plugin Web Application Builder.
 */
@pureRender
class QGISLegend extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      visible: this.props.showExpandedOnStartup
    };
  }
  _hidePanel() {
    this.setState({visible: false});
  }
  _showPanel() {
    this.setState({visible: true});
  }
  _togglePanel() {
    this.setState({visible: !this.state.visible});
  }
  _renderItems(legendData, legendBasePath) {
    var legendNodes = [];
    var symbolFunc = function(symbol) {
      var src = legendBasePath + symbol.href;
      return (<li key={symbol.title}><img src={src}></img> {symbol.title}</li>);
    };
    var symbolFuncB = function(symbol) {
      var src = legendBasePath + symbol.href;
      return (<img key={symbol.title} src={src}></img>);
    };
    for (var id in legendData) {
      var title = LayerStore.findLayer(id).get('title');
      if (title !== null) {
        var symbols;
        if (legendData[id].length > 1) {
          symbols = legendData[id].map(symbolFunc);
          legendNodes.push(
            <li key={id}>
              <ul>
                <h5><strong>{title}</strong></h5> {symbols}
              </ul>
            </li>
          );
        } else {
          symbols = legendData[id].map(symbolFuncB);
          legendNodes.push(
            <li key={id}>
              <ul>
                {symbols} {title}
              </ul>
            </li>
          );
        }

      }
    }
    return (
      <ul className='expandableList'>
        {legendNodes}
      </ul>
    );
  }
  render() {
    const {formatMessage} = this.props.intl;
    var className = 'legend';
    if (this.state.visible) {
      className += ' shown';
    }
    var items = this._renderItems(this.props.legendData, this.props.legendBasePath);
    var onMouseOut = this.props.expandOnHover ? this._hidePanel.bind(this) : undefined;
    var onMouseOver = this.props.expandOnHover ? this._showPanel.bind(this) : undefined;
    var onClick = !this.props.expandOnHover ? this._togglePanel.bind(this) : undefined;
    return (
      <div onMouseOut={onMouseOut} onMouseOver={onMouseOver} className={className}>
        <UI.DefaultButton title={formatMessage(messages.buttontitle)} onClick={onClick}><Icon.Icon name="file-picture-o" /></UI.DefaultButton>
        <div className='legend-panel' id='legend'>{items}</div>
      </div>
    );
  }
}

QGISLegend.propTypes = {
  /**
   * The map from which to extract the layers.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The base path (relative url) to use for finding the artefacts.
   */
  legendBasePath: React.PropTypes.string,
  /**
   * The label and image to use per layer. The object is keyed by layer name currently. For example: {'swamp': [['', '4_0.png']]}.
   */
  legendData: React.PropTypes.object.isRequired,
  /**
   * Should we expand on startup of the application?
   */
  showExpandedOnStartup: React.PropTypes.bool,
  /**
   * Should we expand when hovering over the legend button?
   */
  expandOnHover: React.PropTypes.bool,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

QGISLegend.defaultProps = {
  legendBasePath: './legend/',
  showExpandedOnStartup: false,
  expandOnHover: true
};

export default injectIntl(QGISLegend);
