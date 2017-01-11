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
import RaisedButton from './Button';
import {ToolbarGroup} from 'material-ui/Toolbar';
import Snackbar from 'material-ui/Snackbar';
import MapConfigService from '../services/MapConfigService';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

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
@pureRender
class MapConfig extends React.Component {
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
  render() {
    const {formatMessage} = this.props.intl;
    var info;
    if (this.state.info) {
      info = (<Snackbar autoHideDuration={2000} message={this.state.msg} open={this.state.info} onRequestClose={this._onRequestClose.bind(this)} />);
    }
    return (
      <ToolbarGroup lastChild={this.props.lastChild} firstChild={this.props.firstChild} className={classNames('sdk-component map-config', this.props.className)}>
        {info}
        <RaisedButton tooltip={formatMessage(messages.loadtitle)} disabled={this.state.disabled} label={formatMessage(messages.loadtext)} onTouchTap={this._load.bind(this)} />
        <RaisedButton label={formatMessage(messages.savetext)} tooltip={formatMessage(messages.savetitle)} onTouchTap={this._save.bind(this)} />
      </ToolbarGroup>
    );
  }
}

export default injectIntl(MapConfig);
