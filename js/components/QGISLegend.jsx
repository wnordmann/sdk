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
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import LayerStore from '../stores/LayerStore.js';
import IconButton from 'material-ui/lib/icon-button';
import LegendIcon from 'material-ui/lib/svg-icons/image/image';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
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
 *
 * ```javascript
 * var legendData = {
 *   'geo20130827100512660': [
 *     {
 *      'href': '0_1.png',
 *       'title': 'Hill_111'
 *     }, {
 *       'href': '0_2.png',
 *       'title': 'Hill_112'
 *     }
 *   ],
 *   'pt120130827095302041': [
 *     {
 *       'href': '2_0.png',
 *       'title': '85.0-116.84'
 *     }, {
 *       'href': '2_1.png',
 *       'title': '116.84-148.68'
 *     }
 *   ]
 * };
 * ```
 *
 * ```html
 * <div id='legend'>
 *   <QGISLegend map={map} legendBasePath='./resources/legend/' legendData={legendData} pullRight/>
 * </div>
 * ```
 */
@pureRender
class QGISLegend extends React.Component {
  constructor(props, context) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      muiTheme: context.muiTheme || ThemeManager.getMuiTheme(),
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
      return (<ListItem key={symbol.title} primaryText={symbol.title} leftIcon={<img src={src}></img>} />);
    };
    for (var id in legendData) {
      var title = LayerStore.findLayer(id).get('title');
      if (title !== null) {
        var symbols = legendData[id].map(symbolFunc);
        legendNodes.push(
          <ListItem initiallyOpen={true} key={id} nestedItems={symbols} primaryText={title} />
        );
      }
    }
    return (
      <List>
        {legendNodes}
      </List>
    );
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: Object.assign(this.props.style.root, {
        background: rawTheme.palette.primary1Color
      }),
      icon: {
        color: rawTheme.palette.textColor
      }
    };
  }
  render() {
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    var divClass = {
      'legend': true,
      'shown': this.state.visible,
      'sdk-component': true,
      'qgis-legend': true
    };
    var items = this._renderItems(this.props.legendData, this.props.legendBasePath);
    var onMouseOut = this.props.expandOnHover ? this._hidePanel.bind(this) : undefined;
    var onMouseOver = this.props.expandOnHover ? this._showPanel.bind(this) : undefined;
    var onClick = !this.props.expandOnHover ? this._togglePanel.bind(this) : undefined;
    return (
      <div onMouseOut={onMouseOut} onMouseOver={onMouseOver} className={classNames(divClass, this.props.className)}>
        <IconButton style={styles.root} className='legendbutton' tooltip={formatMessage(messages.buttontitle)} onTouchTap={onClick}><LegendIcon color={styles.icon.color} /></IconButton>
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
   * Style for the button.
   */
  style: React.PropTypes.object,
  /**
   * Should we expand on startup of the application?
   */
  showExpandedOnStartup: React.PropTypes.bool,
  /**
   * Should we expand when hovering over the legend button?
   */
  expandOnHover: React.PropTypes.bool,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

QGISLegend.defaultProps = {
  legendBasePath: './legend/',
  showExpandedOnStartup: false,
  expandOnHover: true,
  style: {
    root: {
      borderRadius: '2px',
      width: '28px',
      height: '28px',
      padding: '2px'
    }
  }
};

QGISLegend.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(QGISLegend);
