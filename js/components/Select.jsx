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
import UI from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  menubuttontext: {
    id: 'select.menubuttontext',
    description: 'Menu button text for select menu',
    defaultMessage: 'Selection'
  },
  rectangletext: {
    id: 'select.rectangletext',
    description: 'Text for select by rectangle menu option',
    defaultMessage: 'Select by rectangle'
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
          });
        } else {
          var state = FeatureStore.getState(lyr);
          for (var i = 0, ii = state.originalFeatures.length; i < ii; ++i) {
            var f = state.originalFeatures[i];
            var geom = f.getGeometry();
            if (geom && geom.intersectsExtent(box)) {
              this._handleSelection(f, selected);
            }
          }
        }
        SelectActions.selectFeatures(lyr, selected, true);
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
      <UI.Dropdown {...this.props} title={formatMessage(messages.menubuttontext)}>
        <UI.DropdownItem onSelect={this._selectByRectangle.bind(this)}>{formatMessage(messages.rectangletext)}</UI.DropdownItem>
      </UI.Dropdown>
    );
  }
}

Select.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Select);
