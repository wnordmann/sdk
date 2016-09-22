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
import Snackbar from 'material-ui/Snackbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import classNames from 'classnames';
import RaisedButton from './Button.jsx';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SaveIcon from 'material-ui/svg-icons/content/save';
import TextField from 'material-ui/TextField';
import WFSService from '../services/WFSService.js';

const messages = defineMessages({
  deletefeature: {
    id: 'editpopup.deletefeature',
    description: 'Button text for delete selected feature',
    defaultMessage: 'Delete'
  },
  deletefeaturetitle: {
    id: 'editpopup.deletefeaturetitle',
    description: 'Button title for delete selected feature',
    defaultMessage: 'Delete the selected feature'
  },
  save: {
    id: 'editpopup.save',
    description: 'Text to show on the save button',
    defaultMessage: 'Save'
  },
  savetitle: {
    id: 'editpopup.savetitle',
    description: 'Button title for the save button',
    defaultMessage: 'Save modified attributes'
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
  },
  deletemsg: {
    id: 'editpopup.deletemsg',
    description: 'Error message to show when delete fails',
    defaultMessage: 'There was an issue deleting the feature.'
  }
});

class EditForm extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme(),
      error: false,
      open: false,
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
  componentWillUnmount() {
    if (this._request) {
      this._request.abort();
    }
  }
  _setError(msg) {
    this.setState({
      open: true,
      error: true,
      msg: msg
    });
  }
  save(evt) {
    const {formatMessage} = this.props.intl;
    if (this.state.dirty) {
      var values = {}, key, hasChange = this._geomDirty;
      for (key in this.state.dirty) {
        hasChange = true;
        values[key] = this.state.values[key];
      }
      if (this._geomDirty) {
        values[this.state.feature.getGeometryName()] = this.state.feature.getGeometry();
      }
      if (hasChange) {
        var me = this;
        var onSuccess = function(result) {
          if (result && result.transactionSummary.totalUpdated === 1) {
            for (key in me.state.dirty) {
              me.state.feature.set(key, values[key]);
            }
            if (me.props.onSuccess) {
              me.props.onSuccess();
            }
            if (me._geomDirty && me.props.onGeometryUpdate) {
              me.props.onGeometryUpdate();
            }
            me.setState({dirty: {}});
          } else {
            me._setError(formatMessage(messages.updatemsg));
          }
        };
        var onFailure = function(xmlhttp, msg) {
          me._setError(msg || (xmlhttp.status + ' ' + xmlhttp.statusText));
        };
        WFSService.updateFeature(this.state.layer, this.props.map.getView(), this.state.feature, values, onSuccess, onFailure);
      }
    }
  }
  _handleRequestClose() {
    this.setState({
      open: false
    });
  }
  _onChangeField(evt) {
    var dirty = this.state.dirty;
    var values = this.state.values;
    values[evt.target.id] = evt.target.value;
    dirty[evt.target.id] = true;
    this.setState({values: values, dirty: dirty});
  }
  deleteFeature() {
    const {formatMessage} = this.props.intl;
    var me = this;
    var feature = this.state.feature;
    this._request = WFSService.deleteFeature(this.state.layer, feature, function() {
      delete me._request;
      if (me.props.onDeleteSuccess) {
        me.props.onDeleteSuccess();
      }
    }, function(xmlhttp, msg) {
      delete me._request;
      msg = msg || formatMessage(messages.deletemsg) + xmlhttp.status + ' ' + xmlhttp.statusText;
      me._setError(msg);
    });
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: {
        color: rawTheme.palette.textColor
      }
    };
  }
  _onChangeGeom(evt) {
    this._geomDirty = true;
    evt.target.un('change', this._onChangeGeom, this);
  }
  render() {
    const styles = this.getStyles();
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        open={this.state.open}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var inputs = [];
    var fid;
    var feature = this.state.feature, layer = this.state.layer;
    if (feature) {
      fid = feature.getId();
      feature.on('change', this._onChangeGeom, this);
      var keys = layer.get('wfsInfo').attributes;
      for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i];
        inputs.push(<TextField floatingLabelText={key} key={key} id={key} onChange={this._onChangeField.bind(this)} value={this.state.values[key]} />);
      }
    }
    // saveButton and deleteButton refs are needed for EditPopup code
    return (
      <div className={classNames('sdk-component edit-form', this.props.className)}>
        <span style={styles.root} className='edit-form-fid'>{fid}</span><br/>
        {inputs}<br/>
        {error}
        <div className='edit-form-submit'>
          <span style={{'float':'right'}}>
            <RaisedButton style={{margin: '0px 12px'}} ref='saveButton' tooltip={formatMessage(messages.savetitle)} tooltipStyle={{'top':'-50px'}} label={formatMessage(messages.save)} onTouchTap={this.save.bind(this)} icon={<SaveIcon />} />
            <RaisedButton style={{margin: '0px 12px'}} ref='deleteButton' tooltip={formatMessage(messages.deletefeaturetitle)} tooltipStyle={{'top':'-50px'}} label={formatMessage(messages.deletefeature)} onTouchTap={this.deleteFeature.bind(this)} icon={<DeleteIcon />} />
          </span>
        </div>
      </div>
    );
  }
}

EditForm.propTypes = {
  /**
   * The ol3 map.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The feature whose values to display and edit.
   */
  feature: React.PropTypes.instanceOf(ol.Feature).isRequired,
  /**
   * The layer from which the feature comes.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Callback function for successfull geometry update
   */
  onGeometryUpdate: React.PropTypes.func,
  /**
   * Callback function for successfull delete
   */
  onDeleteSuccess: React.PropTypes.func,
  /**
   * Callback function for successfull update
   */
  onSuccess: React.PropTypes.func,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

EditForm.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(EditForm, {withRef: true});
