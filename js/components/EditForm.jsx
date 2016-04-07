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
import {doPOST} from '../util.js';
import UI from 'pui-react-buttons';
import Pui from 'pui-react-alerts';
import {BasicInput} from 'pui-react-inputs';

const format = new ol.format.WFS();
const serializer = new XMLSerializer();

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

class EditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      dirty: {},
      layer: props.layer,
      values: props.feature ? props.feature.getProperties() : {},
      feature: props.feature
    };
  }
  componentWillReceiveProps(newProps) {
    if (newProps.feature !== this.state.feature) {
      this.setState({layer: newProps.layer, feature: newProps.feature, values: newProps.feature.getProperties()});
    }
  }
  _readResponse(data) {
    var result;
    if (global.Document && data instanceof global.Document && data.documentElement &&
      data.documentElement.localName == 'ExceptionReport') {
      this._setError(data.getElementsByTagNameNS('http://www.opengis.net/ows', 'ExceptionText').item(0).textContent);
    } else {
      result = format.readTransactionResponse(data);
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
      var node = format.writeTransaction(null, [newFeature], null, {
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      doPOST(layer.get('wfsInfo').url, serializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalUpdated === 1) {
            for (key in this.state.dirty) {
              this.state.feature.set(key, values[key]);
            }
            if (this.props.onSuccess) {
              this.props.onSuccess();
            }
            this.setState({dirty: {}});
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
  _onChangeField(evt) {
    var dirty = this.state.dirty;
    var values = this.state.values;
    values[evt.target.id] = evt.target.value;
    dirty[evt.target.id] = true;
    this.setState({values: values, dirty: dirty});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    var inputs = [];
    var fid;
    var feature = this.state.feature, layer = this.state.layer;
    if (feature) {
      fid = feature.getId();
      var keys = layer.get('wfsInfo').attributes;
      for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i];
        inputs.push(<BasicInput label={key} key={key} id={key} onChange={this._onChangeField.bind(this)} value={this.state.values[key]} />);
      }
    }
    return (
      <div className='edit-form'>
        {error}
        <span className='edit-form-fid'>{fid}</span>
        {inputs}
        <UI.DefaultButton ref='saveButton' onClick={this._save.bind(this)}>{formatMessage(messages.save)}</UI.DefaultButton>
      </div>
    );
  }
}

EditForm.propTypes = {
  /**
   * The feature whose values to display and edit.
   */
  feature: React.PropTypes.instanceOf(ol.Feature).isRequired,
  /**
   * The layer from which the feature comes.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * Callback function for successfull update
   */
  onSuccess: React.PropTypes.func,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(EditForm, {withRef: true});
