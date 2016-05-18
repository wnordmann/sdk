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
import ol from 'openlayers';
import RaisedButton from 'material-ui/lib/raised-button';
import Tooltip from 'material-ui/lib/tooltip';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import Snackbar from 'material-ui/lib/snackbar';
import MapConfigService from '../services/MapConfigService.js';
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
 */
@pureRender
class MapConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: '',
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
  showTooltip(key, evt) {
    var left = ReactDOM.findDOMNode(evt.target).getBoundingClientRect().left;
    const {formatMessage} = this.props.intl;
    this.setState({left: left, showTooltip: true, tooltip: formatMessage(messages[key])});
  }
  hideTooltip() {
    this.setState({showTooltip: false});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var info;
    if (this.state.info) {
      info = (<Snackbar autoHideDuration={2000} message={this.state.msg} open={this.state.info} onRequestClose={this._onRequestClose.bind(this)} />);
    }
    return (
      <ToolbarGroup>
        {info}
        <RaisedButton disabled={this.state.disabled} label={formatMessage(messages.loadtext)} onTouchTap={this._load.bind(this)} onMouseEnter={this.showTooltip.bind(this, 'loadtitle')} onMouseLeave={this.hideTooltip.bind(this)}/>
        <RaisedButton label={formatMessage(messages.savetext)} onMouseEnter={this.showTooltip.bind(this, 'savetitle')} onMouseLeave={this.hideTooltip.bind(this)} onTouchTap={this._save.bind(this)} />
        <Tooltip verticalPosition='bottom' style={{left: this.state.left, boxSizing: 'border-box'}} show={this.state.showTooltip} label={this.state.tooltip} />
      </ToolbarGroup>
    );
  }
}

MapConfig.propTypes = {
  /**
   * The ol3 map to save the layers from.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(MapConfig);
