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
import RaisedButton from './Button';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

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
  }
});

/**
 * The select tool allows users to select features in multiple layers at a time by drawing a rectangle.
 *
 * ```xml
 * <Select toggleGroup='navigation' map={map}/>
 * ```
 */
@pureRender
class Select extends React.Component {
  constructor(props) {
    super(props);
    this._dispatchToken = ToolUtil.register(this);
    FeatureStore.bindMap(this.props.map);
    this._interactions = {
      'RECTANGLE': new ol.interaction.DragBox({
        condition: ol.events.condition.noModifierKeys,
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [0, 0, 255, 1]
          })
        })
      })
    };
    this._interactions.RECTANGLE.on('boxend', this._onBoxEnd, this);
    this.state = {
      disabled: false,
      secondary: false
    };
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
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
    this.props.map.getLayers().forEach(function(lyr) {
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
          });
        }
      }
    }, this);
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
      this.activate(this._interactions.RECTANGLE);
      this.setState({secondary: !this.state.secondary});
    }
  }
  disable() {
    this.setState({disabled: true});
  }
  enable() {
    this.setState({disabled: false});
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
     <RaisedButton {...this.props} className={classNames('sdk-component select', this.props.className)} secondary={this.state.secondary} disabled={this.state.disabled} label={formatMessage(messages.menubuttontext)} tooltip={formatMessage(messages.menubuttontitle)} onTouchTap={this._selectByRectangle.bind(this)} />
    );
  }
}

Select.propTypes = {
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Select);
