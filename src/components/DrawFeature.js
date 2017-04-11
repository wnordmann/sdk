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
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ToolUtil from '../toolutil';
import ToolActions from '../actions/ToolActions';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';

const messages = defineMessages({
  dropdowntitle: {
    id: 'drawfeature.dropdowntitle',
    description: 'Text for draw feature',
    defaultMessage: 'Draw Feature'
  },
  polygon: {
    id: 'drawfeature.polygon',
    description: 'Text for draw polygon menu item',
    defaultMessage: 'Draw Polygon'
  },
  linestring: {
    id: 'drawfeature.linestring',
    description: 'Text for draw polygon menu item',
    defaultMessage: 'Draw Line'
  },
  point: {
    id: 'drawfeature.point',
    description: 'Text for draw polygon menu item',
    defaultMessage: 'Draw Point'
  }
});

/**
 * Allows users to draw new features. This can work on WFS-T enabled layers, or on local vector layers.
 * For WFS-T the layer needs to have isWFST set to true. Also a wfsInfo object needs to be
 * configured on the layer with the following properties:
 * - featureNS: the namespace of the WFS typename
 * - featureType: the name (without prefix) of the underlying WFS typename
 * - geometryType: the type of geometry (e.g. MultiPolygon)
 * - geometryName: the name of the geometry attribute
 * - url: the online resource of the WFS endpoint
 *
 * ```xml
 * <DrawFeature map={map} />
 * ```
 */
class DrawFeature extends React.PureComponent {
  static propTypes = {
    /**
     * The ol3 map whose layers can be used for the WFS-T tool.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.
     */
    toggleGroup: React.PropTypes.string,
    /**
     * Identifier to use for this tool. Can be used to group tools together.
     */
    toolId: React.PropTypes.string,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    this._dispatchToken = ToolUtil.register(this);
    this.state = {
      active: false,
      muiTheme: context.muiTheme || getMuiTheme(),
      disabled: false,
      error: false,
      open: false
    };
    this._tempSource = new ol.source.Vector();
    this._tempLayer = new ol.layer.Vector({
      zIndex: 1000,
      title: null,
      source: this._tempSource
    });
    this._interactions = {
      polygon: new ol.interaction.Draw({
        source: this._tempSource,
        type: 'Polygon'
      }),
      linestring: new ol.interaction.Draw({
        source: this._tempSource,
        type: 'LineString'
      }),
      point: new ol.interaction.Draw({
        source: this._tempSource,
        type: 'Point'
      })
    };
    for (var key in this._interactions) {
      this._interactions[key].on('drawend', this._onDrawEnd, this);
    }
  }
  getChildContext() {
    return {muiTheme: this.state.muiTheme};
  }
  componentDidMount() {
    this.props.map.addLayer(this._tempLayer);
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
    this.deactivate();
  }
  activate(interactions) {
    ToolUtil.activate(this, interactions);
  }
  deactivate() {
    ToolUtil.deactivate(this);
  }
  _setActiveInteractions(active) {
    this.props.map.getInteractions().forEach(function(interaction) {
      if (interaction instanceof ol.interaction.Draw || interaction instanceof ol.interaction.DoubleClickZoom) {
        interaction.setActive(active);
      }
    });
  }
  _onDrawEnd(evt) {
    var tempSource = this._tempSource;
    this._setActiveInteractions(false);
    var me = this;
    ToolActions.showEditPopup(evt.feature, undefined, function() {
      tempSource.clear();
      me._setActiveInteractions(true);
    });
  }
  _drawPoly() {
    this.deactivate();
    this.activate([this._interactions.polygon]);
  }
  _drawLine() {
    this.deactivate();
    this.activate([this._interactions.linestring]);
  }
  _drawPoint() {
    this.deactivate();
    this.activate([this._interactions.point]);
  }
  disable() {
    this.setState({disabled: true});
  }
  enable() {
    this.setState({disabled: false});
  }
  setActive(active) {
    this.setState({active: active});
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (<IconMenu
      anchorOrigin={{horizontal: 'right', vertical: 'bottom'}} targetOrigin={{horizontal: 'right', vertical: 'top'}}
      iconButtonElement={<IconButton tooltip={formatMessage(messages.dropdowntitle)} disabled={this.state.disabled} iconClassName="headerIcons ms ms-draw" />}
      disabled={this.state.disabled}>
      <MenuItem leftIcon={<i className='ms ms-draw-polygon'/>} primaryText={formatMessage(messages.polygon)} onTouchTap={this._drawPoly.bind(this)} />
      <MenuItem leftIcon={<i className='ms ms-draw-line'/>} onTouchTap={this._drawLine.bind(this)} primaryText={formatMessage(messages.linestring)} />
      <MenuItem leftIcon={<i className='ms ms-draw-point'/>} onTouchTap={this._drawPoint.bind(this)} primaryText={formatMessage(messages.point)} />
    </IconMenu>);
  }
}

export default injectIntl(DrawFeature, {withRef: true});
