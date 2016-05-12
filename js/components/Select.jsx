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
import SelectActions from '../actions/SelectActions.js';
import MapTool from './MapTool.js';
import FeatureStore from '../stores/FeatureStore.js';
import WFSService from '../services/WFSService.js';
import RaisedButton from 'material-ui/lib/raised-button';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  menubuttontext: {
    id: 'select.menubuttontext',
    description: 'Menu button text for select function',
    defaultMessage: 'Select'
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
class Select extends MapTool {
  constructor(props) {
    super(props);
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
  }
  _onBoxEnd(evt) {
    var box = evt.target.getGeometry().getExtent();
    this.props.map.getLayers().forEach(function(lyr) {
      if (lyr.getVisible() && lyr.get('isSelectable') === true) {
        var selected = [];
        if (lyr.getSource() instanceof ol.source.Vector) {
          lyr.getSource().forEachFeatureIntersectingExtent(box, function(feature) {
            this._handleSelection(feature, selected);
          }, this);
          SelectActions.selectFeatures(lyr, selected, true);
        } else {
          var me = this;
          WFSService.bboxFilter(lyr, this.props.map.getView(), box, function(features) {
            for (var i = 0, ii = features.length; i < ii; ++i) {
              me._handleSelection(features[i], selected);
            }
            SelectActions.selectFeatures(lyr, selected, true);
          }, function() {
          });
        }
      }
    }, this);
  }
  activate(interactions) {
    super.activate(interactions);
    FeatureStore.setSelectOnClick(true);
  }
  deactivate() {
    super.deactivate();
    FeatureStore.setSelectOnClick(false);
  }
  _selectByRectangle() {
    this.deactivate();
    this.activate(this._interactions.RECTANGLE);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
     <RaisedButton {...this.props} label={formatMessage(messages.menubuttontext)} onTouchTap={this._selectByRectangle.bind(this)} />
    );
  }
}

Select.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Select.defaultProps = {
  style: {
    margin: '10px 12px'
  }
};

export default injectIntl(Select);
