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
import {doPOST} from '../util.js';
import Pui from 'pui-react-alerts';
import './EditPopup.css';

const messages = defineMessages({
  save: {
    id: 'editpopup.save',
    description: 'Text to show on the save button',
    defaultMessage: 'Save'
  },
  errormsg: {
    id: 'editpopup.errormsg',
    description: 'Error message to show the user when a request fails',
    defaultMessage: 'Error saving this feature to GeoServer. {msg}'
  },
  updatemsg: {
    id: 'editpopup.updatemsg',
    description: 'Text to show if the transaction fails',
    defaultMessage: 'Error updating the feature\'s attributes using WFS-T.'
  }
});

/**
 * Popup that can be used for feature editing (attribute form).
 */
class EditPopup extends BasePopup {
  constructor(props) {
    super(props);
    this.props.map.on('singleclick', this._onMapClick, this);
    this.active = true;
    this._format = new ol.format.WFS();
    this._serializer = new XMLSerializer();
    this.state = {
      error: false,
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
      var hasActiveDrawModify = false;
      map.getInteractions().forEach(function(interaction) {
        if (interaction.getActive() && (interaction instanceof ol.interaction.Draw || interaction instanceof ol.interaction.Modify)) {
          hasActiveDrawModify = true;
        }
      });
      if (hasActiveDrawModify) {
        return;
      }
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
  _readResponse(data) {
    var result;
    if (global.Document && data instanceof global.Document && data.documentElement &&
      data.documentElement.localName == 'ExceptionReport') {
      this._setError(data.getElementsByTagNameNS('http://www.opengis.net/ows', 'ExceptionText').item(0).textContent);
    } else {
      result = this._format.readTransactionResponse(data);
    }
    return result;
  }
  _setError(msg) {
    this.setState({
      error: true,
      msg: msg
    });
  }
  _save() {
    const {formatMessage} = this.props.intl;
    if (this.state.dirty) {
      var values = {}, key;
      for (key in this.state.dirty) {
        values[key] = this.state.values[key];
      }
      var layer = this.state.layer;
      var wfsInfo = layer.get('wfsInfo');
      var feature = this.state.feature;
      var newFeature = new ol.Feature(values);
      newFeature.setId(feature.getId());
      var node = this._format.writeTransaction(null, [newFeature], null, {
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      doPOST(layer.get('wfsInfo').url, this._serializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalUpdated === 1) {
            for (key in this.state.dirty) {
              this.state.feature.set(key, values[key]);
            }
            this.setVisible(false);
            this.state.values = {};
            this.state.dirty = {};
          } else {
            this._setError(formatMessage(messages.updatemsg));
          }
        },
        function(xmlhttp) {
          this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
        },
        this
      );
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    var inputs = [];
    var fid;
    if (this.state.feature) {
      fid = this.state.feature.getId();
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
          {error}
          <span className='popup-fid'>{fid}</span>
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
