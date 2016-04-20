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
import IconMenu from 'material-ui/lib/menus/icon-menu';
import RaisedButton from 'material-ui/lib/raised-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import MapConfigService from '../services/MapConfigService.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  menubuttontext: {
    id: 'mapconfig.menubuttontext',
    description: 'Title for the Map Config menu',
    defaultMessage: 'Map'
  },
  savetext: {
    id: 'mapconfig.savetext',
    description: 'Text for the Save menu option',
    defaultMessage: 'Save'
  },
  loadtext: {
    id: 'mapconfig.loadtext',
    description: 'Text for the Load menu option',
    defaultMessage: 'Load'
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
    this.state = {value: null};
  }
  _load() {
    var config = global.localStorage.getItem(localStorageKey);
    var mapConfig = JSON.parse(config);
    MapConfigService.load(mapConfig, this.props.map);
  }
  _save() {
    var config = MapConfigService.save(this.props.map);
    var output = JSON.stringify(config);
    global.localStorage.setItem(localStorageKey, output);
  }
  _handleChange(event, value) {
    if (value === 1) {
      this._load();
    } else if (value === 2) {
      this._save();
    }
    this.setState({value: value});
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <IconMenu iconButtonElement={<RaisedButton label={formatMessage(messages.menubuttontext)} />} value={this.state.value} onChange={this._handleChange.bind(this)}>
        <MenuItem value={1} primaryText={formatMessage(messages.loadtext)}/>
        <MenuItem value={2} primaryText={formatMessage(messages.savetext)}/>
      </IconMenu>
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
