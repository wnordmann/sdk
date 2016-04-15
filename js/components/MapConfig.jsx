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
import UI from 'pui-react-dropdowns';
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
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.Dropdown {...this.props} title={formatMessage(messages.menubuttontext)}>
        <UI.DropdownItem onSelect={this._load.bind(this)}>{formatMessage(messages.loadtext)}</UI.DropdownItem>
        <UI.DropdownItem onSelect={this._save.bind(this)}>{formatMessage(messages.savetext)}</UI.DropdownItem>
      </UI.Dropdown>
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
