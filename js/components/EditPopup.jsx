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
import ReactDOM from 'react-dom';
import BasePopup from './BasePopup.jsx';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {BasicInput} from 'pui-react-inputs';
import UI from 'pui-react-buttons';
import FeatureActions from '../actions/FeatureActions.js';

const messages = defineMessages({
  save: {
    id: 'infopopup.save',
    description: 'Text to show on the save button',
    defaultMessage: 'Save'
  }
});

class EditPopup extends BasePopup {
  constructor(props) {
    super(props);
    this.props.map.on('singleclick', this._onMapClick, this);
    this.active = true;
    this.state = {
      values: {},
      dirty: {}
    };
  }
  _onChangeField(evt) {
    var dirty = this.state.dirty;
    var values = this.state.values;
    values[evt.target.id] = evt.target.value;
    dirty[evt.target.id] = true;
    this.setState({values: values, dirty: dirty});
  }
  _onMapClick(evt) {
    if (this.active) {
      var map = this.props.map;
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var me = this;
      var cont = false;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          if (layer.get('isWFST')) {
            cont = true;
            me.setState({
              feature: feature,
              dirty: {},
              layer: layer,
              values: feature.getProperties()
            });
          }
        }
      });
      if (cont === true) {
        me.overlayPopup.setPosition(coord);
        me.setVisible(true);
      } else {
        me.setVisible(false);
      }
    }
  }
  setVisible(visible) {
    super.setVisible(visible);
    var saveButton = ReactDOM.findDOMNode(this.refs.saveButton);
    var me = this;
    if (saveButton && saveButton.onclick === null) {
      saveButton.onclick = function() {
        me._save();
        return false;
      };
    }
  }
  _save() {
    if (this.state.dirty) {
      var values = {};
      for (var key in this.state.dirty) {
        values[key] = this.state.values[key];
        // TODO do this in the success handler
        this.state.feature.set(key, values[key]);
      }
      FeatureActions.modifyFeatureAttributes(this.state.layer, this.state.feature, values);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    var inputs = [];
    if (this.state.feature) {
      var keys = this.state.feature.getKeys();
      for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i];
        if (key !== this.state.feature.getGeometryName()) {
          inputs.push(<BasicInput label={key} key={key} id={key} onChange={this._onChangeField.bind(this)} value={this.state.values[key]} />);
        }
      }
    }
    return (
      <article>
        <a href="#" ref="popupCloser" className="popup-closer fa fa-times fa-pull-right"></a>
        <div className='popup-content' ref='content'>
          {inputs}
          <UI.DefaultButton ref="saveButton">{formatMessage(messages.save)}</UI.DefaultButton>
        </div>
      </article>
    );
  }
}

EditPopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(EditPopup);
