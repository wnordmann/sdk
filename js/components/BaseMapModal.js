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
import Dialog from 'material-ui/Dialog';
import Button from './Button';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import {GridList, GridTile} from 'material-ui/GridList';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const messages = defineMessages({
  title: {
    id: 'basemapmodal.title',
    description: 'Title for the base map modal dialog',
    defaultMessage: 'Select a basemap'
  },
  closebutton: {
    id: 'basemapmodal.closebutton',
    description: 'Text for the close button',
    defaultMessage: 'Close'
  }
});

class BaseMapModal extends React.Component {
  static propTypes = {
    /**
     * The OpenLayers Map.
     */
    map: React.PropTypes.instanceOf(ol.Map),
    /**
     * Tile services to display as options in this dialog.
     */
    tileServices: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      endpoint: React.PropTypes.string.isRequired,
      standard: React.PropTypes.string.isRequired,
      attribution: React.PropTypes.string,
      thumbnail: React.PropTypes.string.isRequired
    })),
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    tileServices: [{
      name: 'light_all',
      description: 'CartoDB light',
      endpoint: 'http://s.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      standard: 'XYZ',
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      thumbnail: 'http://s.basemaps.cartocdn.com/light_all/0/0/0.png'
    }, {
      name: 'World_Imagery',
      description: 'ESRI world imagery',
      endpoint: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      standard: 'XYZ',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      thumbnail: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/0/0/0'
    }, {
      name: 'dark_all',
      description: 'CartoDB dark',
      endpoint: 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      standard: 'XYZ',
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      thumbnail: 'http://s.basemaps.cartocdn.com/dark_all/0/0/0.png'
    }]
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this._added = [];
  }
  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }
  close() {
    this.setState({open: false});
  }
  open() {
    this.setState({open: true});
  }
  _createSource(config) {
    if (config.standard === 'XYZ') {
      return new ol.source.XYZ({
        url: config.endpoint,
        attributions: config.attribution ? [
          new ol.Attribution({html: config.attribution})
        ] : undefined
      });
    }
  }
  _createLayer(name) {
    var config;
    for (var i = 0, ii = this.props.tileServices.length; i < ii; ++i) {
      if (this.props.tileServices[i].name === name) {
        config = this.props.tileServices[i];
        break;
      }
    }
    return new ol.layer.Tile({
      type: 'base',
      title: config.description,
      source: this._createSource(config)
    });
  }
  _tileClick(name) {
    if (this._added.indexOf(name) !== -1) {
      return;
    }
    var foundGroup = false;
    var map = this.props.map;
    var olLayer = this._createLayer(name);
    map.getLayers().forEach(function(lyr) {
      if (foundGroup === false && lyr.get('type') === 'base-group') {
        foundGroup = true;
        lyr.getLayers().forEach(function(child) {
          child.setVisible(false);
        });
        lyr.getLayers().push(olLayer);
      }
    });
    if (foundGroup === false) {
      map.addLayer(olLayer);
    }
    this._added.push(name);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var actions = [
      <Button buttonType='Flat' label={formatMessage(messages.closebutton)} onTouchTap={this.close.bind(this)} />
    ];
    return (<Dialog autoScrollBodyContent={true} actions={actions} title={formatMessage(messages.title)} modal={true} open={this.state.open} onRequestClose={this.close.bind(this)}>
      <GridList cols={3} cellHeight={120}>
        {this.props.tileServices.map((tileService) => (
          <GridTile style={{cursor: 'pointer'}} onTouchTap={this._tileClick.bind(this, tileService.name)}
            key={tileService.name}
            title={tileService.description}>
            <img src={tileService.thumbnail} />
          </GridTile>
        ))}
      </GridList>
    </Dialog>);
  }
}

export default injectIntl(BaseMapModal, {withRef: true});
