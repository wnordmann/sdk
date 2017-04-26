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
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import Button from './Button';
import MapConfigService from '../services/MapConfigService';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  savetext: {
    id: 'mapconfig.savetext',
    description: 'Text for the Save button',
    defaultMessage: 'Save'
  },
  savetitle: {
    id: 'mapconfig.savetitle',
    description: 'Title for the Save button',
    defaultMessage: 'Save map configuration to local storage'
  },
  loadtext: {
    id: 'mapconfig.loadtext',
    description: 'Text for the Load button',
    defaultMessage: 'Load'
  },
  loadtitle: {
    id: 'mapconfig.loadtitle',
    description: 'Title for the Load button',
    defaultMessage: 'Load map configuration from local storage'
  },
  savesuccess: {
    id: 'mapconfig.savesuccess',
    description: 'Info text to show if save is successfull',
    defaultMessage: 'Map was saved successfully to the browser\'s local storage.'
  },
  savefailure: {
    id: 'mapconfig.savefailure',
    description: 'Info text to show if save is not successfull',
    defaultMessage: 'There was an error saving the map to the browser\'s local storage.'
  },
  loadsuccess: {
    id: 'mapconfig.loadsuccess',
    description: 'Info text to show if load is successfull',
    defaultMessage: 'Map was loaded successfully from the browser\'s local storage.'
  },
  loadfailure: {
    id: 'mapconfig.loadfailure',
    description: 'Info text to show if load is not successfull',
    defaultMessage: 'There was an error loading the map from the browser\'s local storage'
  },
  dropdowntext: {
    id: 'mapconfig.dropdowntext',
    description: 'Text to use on the Map Config drop down',
    defaultMessage: 'Map Config'
  }
});

const localStorageKey = 'web-sdk-map-config';

/**
 * Export the map configuration and ability to reload it from local storage.
 *
 * ```xml
 * <MapConfig map={map} />
 * ```
 *
 * ![MapConfig](../MapConfig.png)
 */
class MapConfig extends React.PureComponent {
  static propTypes = {
    /**
     * The ol3 map to save the layers from.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * Are we the last child of the toolbar?
     */
    lastChild: React.PropTypes.bool,
    /**
     * Are we the first child of the toolbar?
     */
    firstChild: React.PropTypes.bool,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      msg: null,
      info: false,
      disabled: global.localStorage.getItem(localStorageKey) === null
    };
  }
  _load() {
    const {formatMessage} = this.props.intl;
    var msg;
    try {
      var config = global.localStorage.getItem(localStorageKey);
      var mapConfig = JSON.parse(config);
      MapConfigService.load(mapConfig, this.props.map);
      msg = formatMessage(messages.loadsuccess);
    } catch (e) {
      msg = formatMessage(messages.loadfailure);
    }
    this.setState({
      info: true,
      msg: msg
    });
  }
  _save() {
    const {formatMessage} = this.props.intl;
    var msg, disabled;
    try {
      var config = MapConfigService.save(this.props.map);
      var output = JSON.stringify(config);
      global.localStorage.setItem(localStorageKey, output);
      msg = formatMessage(messages.savesuccess);
      disabled = false;
    } catch (e) {
      msg = formatMessage(messages.savefailure);
      disabled = true;
    }
    this.setState({
      disabled: disabled,
      info: true,
      msg: msg
    });
  }
  _onRequestClose() {
    this.setState({
      info: false
    });
  }
  _handleChange(event, value) {
    if (value === 1) {
      this._load();
    } else if (value === 2) {
      this._save();
    } else {
      this._clear();
    }
    this.setState({value: value});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var info;
    if (this.state.info) {
      info = (<Snackbar autoHideDuration={2000} message={this.state.msg} open={this.state.info} onRequestClose={this._onRequestClose.bind(this)} />);
    }
    return (
    <span>
      <IconMenu
        style={this.props.style}
        className={classNames('sdk-component map-config headerIcons', this.props.className)}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}} targetOrigin={{horizontal: 'right', vertical: 'top'}}
        iconButtonElement={<Button tooltip={formatMessage(messages.dropdowntext)} buttonType='Icon' disabled={this.state.disabled} iconClassName='headerIcons ms ms-map-o'/>}
        value={this.state.value}
        onChange={this._handleChange.bind(this)}>
        <MenuItem disabled={this.state.disabled} value={1} primaryText={formatMessage(messages.loadtext)}  />
        <MenuItem disabled={this.state.disabled} value={2} primaryText={formatMessage(messages.savetext)} />
      </IconMenu>
      {info}
    </span>
    );
  }
}

export default injectIntl(MapConfig);
