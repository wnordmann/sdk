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

/* eslint react/prop-types: 0 */
import React from 'react';
import ol from 'openlayers';
import classNames from 'classnames';
import SelectActions from '../actions/SelectActions';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ToolUtil from '../toolutil';
import WFSService from '../services/WFSService';
import FeatureStore from '../stores/FeatureStore';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Button from './Button';
import Divider from 'material-ui/Divider';
import Delete from 'material-ui/svg-icons/action/delete';
import LayerStore from '../stores/LayerStore';

const messages = defineMessages({
  menubuttontext: {
    id: 'select.menubuttontext',
    description: 'Menu button text for select function',
    defaultMessage: 'Select'
  },
  menubuttontitle: {
    id: 'select.menubuttontitle',
    description: 'Menu button title for select function',
    defaultMessage: 'Select features by rectangle'
  },
  selectbyrectangletext: {
    id: 'select.selectbyrectangletext',
    description: 'Text for select by rectangle option',
    defaultMessage: 'Select by rectangle'
  },
  clearselectiontext: {
    id: 'select.clearselectiontext',
    description: 'Text for clear option',
    defaultMessage: 'Clear selection'
  }
});

/**
 * The select tool allows users to select features in multiple layers at a time by drawing a rectangle.
 *
 * ```xml
 * <Select toggleGroup='navigation' map={map}/>
 * ```
 *
 * ![Select](../Select.png)
 */
class Select extends React.PureComponent {
  static propTypes = {
    /**
     * The map onto which to activate and deactivate the interactions.
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
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object,
    proxy: React.PropTypes.string,
    requestHeaders: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    LayerStore.bindMap(props.map);
    this._dispatchToken = ToolUtil.register(this);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    FeatureStore.bindMap(this.props.map, this._proxy);
    Select.interactions.RECTANGLE.on('boxend', this._onBoxEnd, this);
    this.state = {
      disabled: false,
      secondary: false
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  static interactions = {
    'RECTANGLE': new ol.interaction.DragBox({
      condition: ol.events.condition.noModifierKeys,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: [0, 0, 255, 1]
        })
      })
    })
  };
  _handleSelection(feature, selected) {
    if (feature.get('features')) {
      var children = feature.get('features');
      for (var i = 0, ii = children.length; i < ii; ++i) {
        children[i].selected = true;
      }
      feature.changed();
      selected = selected.concat(children);
    } else {
      selected.push(feature);
    }
    return selected;
  }
  _onBoxEnd(evt) {
    var box = evt.target.getGeometry().getExtent();
    var layers = LayerStore.getState().flatLayers;
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      var lyr = layers[i];
      if (lyr.getVisible() && lyr.get('isSelectable') === true) {
        var selected = [];
        if (lyr.getSource() instanceof ol.source.Vector) {
          lyr.getSource().forEachFeatureIntersectingExtent(box, function(feature) {
            selected = this._handleSelection(feature, selected);
          }, this);
          SelectActions.selectFeatures(lyr, selected, true);
        } else {
          var me = this;
          WFSService.bboxFilter(lyr, this.props.map.getView(), box, function(features) {
            for (var i = 0, ii = features.length; i < ii; ++i) {
              selected = me._handleSelection(features[i], selected);
            }
            FeatureStore.appendFeatures(lyr, selected);
            SelectActions.selectFeatures(lyr, selected, true);
          }, undefined, this._proxy, this._requestHeaders);
        }
      }
    }
  }
  activate(interactions) {
    ToolUtil.activate(this, interactions);
    FeatureStore.setSelectOnClick(true);
    this.setState({secondary: true});
  }
  deactivate() {
    ToolUtil.deactivate(this);
    FeatureStore.setSelectOnClick(false);
    this.setState({secondary: false});
  }
  _selectByRectangle() {
    if (!this.state.secondary) {
      this.activate(Select.interactions.RECTANGLE);
      this.setState({secondary: !this.state.secondary});
    }
  }
  disable() {
    this.setState({disabled: true});
  }
  enable() {
    this.setState({disabled: false});
  }
  _clear() {
    this.props.map.getLayers().forEach(function(lyr) {
      if (lyr.getVisible() && lyr.get('isSelectable') === true) {
        SelectActions.clear(lyr);
      }
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <IconMenu style={this.props.style} anchorOrigin={{horizontal: 'right', vertical: 'bottom'}} targetOrigin={{horizontal: 'right', vertical: 'top'}}
        className={classNames('sdk-component select', this.props.className)}
         iconButtonElement={<Button secondary={this.state.secondary} buttonType='Icon' tooltip={formatMessage(messages.menubuttontitle)} disabled={this.state.disabled} iconClassName="headerIcons ms ms-select-box"/>}>
         <MenuItem disabled={this.state.disabled} onTouchTap={this._selectByRectangle.bind(this)} primaryText={formatMessage(messages.selectbyrectangletext)} leftIcon={<i className={'ms ms-select-box'}></i>} />
         <Divider />
         <MenuItem disabled={this.state.disabled} onTouchTap={this._clear.bind(this)} primaryText={formatMessage(messages.clearselectiontext)} leftIcon={<Delete />} />
      </IconMenu>
    );
  }
}

export default injectIntl(Select);
