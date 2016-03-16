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
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontitle: {
    id: 'save.buttontitle',
    description: 'Title for the Save button',
    defaultMessage: 'Save map configuration'
  },
  buttontext: {
    id: 'save.buttontext',
    description: 'Text for the Save button',
    defaultMessage: 'Save'
  }
});

/**
 * Export the map configuration.
 */
@pureRender
class Save extends React.Component {
  constructor(props) {
    super(props);
  }
  _handleClick() {
    var map = this.props.map;
    var layers = [];
    var root = map.getLayerGroup();
    map.getLayers().forEach(function(layer) {
      var config = {};
      layers.push(config);
      this._getLayerConfig(config, layer);
    }, this);
    var config = {};
    config.layers = layers;
    var output = JSON.stringify(config);
    console.log(output);
  }
  _getLayerType(layer) {
    if (layer instanceof ol.layer.Group) {
      return 'Group';
    } else if (layer instanceof ol.layer.Vector) {
      return 'Vector';
    } else if (layer instanceof ol.layer.Tile) {
      return 'Tile';
    } else if (layer instanceof ol.layer.Image) {
      return 'Image';
    }
  }
  _getFormatType(format) {
    if (format instanceof ol.format.GeoJSON) {
      return 'GeoJSON';
    }
  }
  _getSourceConfig(source) {
    var config = {};
    if (source instanceof ol.source.TileWMS) {
      config.type = 'TileWMS';
    } else if (source instanceof ol.source.Cluster) {
      config.type = 'Cluster';
      config.child = this._getSourceConfig(source.getSource());
    } else if (source instanceof ol.source.Vector) {
      config.format = this._getFormatType(source.getFormat());
      config.url = source.getUrl();
      config.type = 'Vector';
    } else if (source instanceof ol.source.ImageWMS) {
      config.type = 'ImageWMS';
    } else if (source instanceof ol.source.MapQuest) {
      config.type = 'MapQuest';
    }
    return config;
  }
  _getLayerConfig(config, layer) {
    config.type = this._getLayerType(layer);
    config.properties = layer.getProperties();
    var source = (config.type !== 'Group') ? layer.getSource(): null;
    if (source) {
      delete config.properties.source;
      config.source = this._getSourceConfig(source);
    }
    if (layer instanceof ol.layer.Group) {
      delete config.properties.layers;
      config.children = [];
      var childConfig = {};
      layer.getLayers().forEach(function(child) {
        var childConfig = {};
        config.children.push(childConfig);
        this._getLayerConfig(childConfig, child);
      }, this);
    }
    return config;
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.DefaultButton title={formatMessage(messages.buttontitle)} onClick={this._handleClick.bind(this)}>
        <Icon.Icon name="floppy-o" /> {formatMessage(messages.buttontext)}
      </UI.DefaultButton>
    );
  }
}

Save.propTypes = {
  /**
   * The ol3 map to save the layers from.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Save);
