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
import BasePopup from './BasePopup.jsx';
import ol from 'openlayers';
import classNames from 'classnames';
import WMSService from '../services/WMSService.js';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import IconButton from 'material-ui/lib/icon-button';
import CloserIcon from 'material-ui/lib/svg-icons/navigation/close';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  nofeatures: {
    id: 'infopopup.nofeatures',
    description: 'Text to show if no features were found',
    defaultMessage: 'No features at this location'
  },
  nulltext: {
    id: 'infopopup.nulltext',
    description: 'Text to show if attribute has no value',
    defaultMessage: 'NULL'
  },
  nametext: {
    id: 'infopopup.nametext',
    description: 'Text to show for the name column',
    defaultMessage: 'Name'
  },
  valuetext: {
    id: 'infopopup.valuetext',
    description: 'Text to show for the value column',
    defaultMessage: 'Value'
  }
});

const ALL_ATTRS = '#AllAttributes';

/**
 * Popup to show feature info. This can be through WMS GetFeatureInfo or local vector data.
 *
 * ```html
 * <div id='popup' className='ol-popup'>
 *   <InfoPopup toggleGroup='navigation' map={map} />
 * </div>
 * ```
 */
class InfoPopup extends BasePopup {
  constructor(props) {
    super(props);
    if (this.props.hover === true) {
      this.props.map.on('pointermove', this._onMapClick, this);
    } else {
      this.props.map.on('singleclick', this._onMapClick, this);
    }
    this._formats = {};
    this._formats['application/json'] = new ol.format.GeoJSON();
    this._formats['application/vnd.ogc.gml'] = new ol.format.WMSGetFeatureInfo();
    this.active = true;
    this._count = 0;
    this.state = {
      popupTexts: []
    };
  }
  _forEachLayer(layers, layer) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function(groupLayer) {
        this._forEachLayer(layers, groupLayer);
      }, this);
    } else if (layer instanceof ol.layer.Tile && layer.getVisible() && layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo') && layer.get('popupInfo') !== '') {
      layers.push(layer);
    }
  }
  _createSimpleTable(response) {
    var features = response.features;
    var layer = response.layer;
    this._count++;
    const {formatMessage} = this.props.intl;
    var fid;
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var feature = features[i];
      fid = feature.getId();
      var keys = feature.getKeys();
      var geom = feature.getGeometryName();
      for (var j = 0, jj = keys.length; j < jj; ++j) {
        var key = keys[j];
        if (key !== geom && key !== 'boundedBy') {
          rows.push(<TableRow key={key}><TableRowColumn>{key}</TableRowColumn><TableRowColumn>{feature.get(key)}</TableRowColumn></TableRow>);
        }
      }
    }
    return (<Table key={this._count}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn colSpan="2" tooltip={fid} style={{textAlign: 'center'}}>
            {layer.get('title')}
          </TableHeaderColumn>
        </TableRow>
        <TableRow>
          <TableHeaderColumn>{formatMessage(messages.nametext)}</TableHeaderColumn>
          <TableHeaderColumn>{formatMessage(messages.valuetext)}</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {rows}
      </TableBody>
    </Table>);
  }
  _fetchData(evt, popupTexts, cb) {
    var map = this.props.map;
    var allLayers = [];
    this._forEachLayer(allLayers, map.getLayerGroup());
    var len = allLayers.length;
    var finishedQueries = 0;
    var finishedQuery = function() {
      finishedQueries++;
      if (len === finishedQueries) {
        cb();
      }
    };
    var view = map.getView();
    var onReadyAll = function(response) {
      if (response !== false && response.text) {
        popupTexts.push(response.text);
      }
      finishedQuery();
    };
    const {formatMessage} = this.props.intl;
    var popupDef;
    var me = this;
    this._noFeaturesFound = false;
    var onReady = function(response) {
      var features = response.features;
      if (features.length) {
        var popupContent;
        if (popupDef === ALL_ATTRS) {
          me._contentAsObject = true;
          popupContent = me._createSimpleTable(response);
        } else {
          for (var j = 0, jj = features.length; j < jj; ++j) {
            popupContent = popupDef;
            var feature = features[j];
            var values = feature.getProperties();
            for (var key in values) {
              var value = values[key];
              if (value) {
                popupContent = popupContent.replace('[' + key + ']', value);
              } else {
                popupContent = popupContent.replace('[' + key + ']', formatMessage(messages.nulltext));
              }
            }
          }
        }
        popupTexts.push(popupContent);
      } else {
        me._noFeaturesFound = true;
      }
      finishedQuery();
    };
    var called = false;
    for (var i = 0; i < len; i++) {
      var layer = allLayers[i];
      popupDef = layer.get('popupInfo');
      if (popupDef === ALL_ATTRS) {
        called = true;
        var infoFormat = this.props.infoFormat;
        var callback = (infoFormat === 'text/plain' || infoFormat === 'text/html') ? onReadyAll : onReady;
        WMSService.getFeatureInfo(layer, evt.coordinate, view, infoFormat, callback);
      } else if (popupDef) {
        called = true;
        WMSService.getFeatureInfo(layer, evt.coordinate, view, 'application/json', onReady);
      }
    }
    if (called === false) {
      cb();
    }
  }
  _onMapClick(evt) {
    if (this.active) {
      const {formatMessage} = this.props.intl;
      var map = this.props.map;
      if (super.hasActiveDrawModify()) {
        return;
      }
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var popupTexts = [];
      this._contentAsObject = false;
      var me = this;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          var popupDef = layer.get('popupInfo');
          if (popupDef) {
            var featureKeys = feature.getKeys();
            for (var i = 0, ii = featureKeys.length; i < ii; i++) {
              var value = feature.get(featureKeys[i]);
              if (value) {
                popupDef = popupDef.replace('[' + featureKeys[i] + ']', feature.get(featureKeys[i]));
              } else {
                popupDef = popupDef.replace('[' + featureKeys[i] + ']', formatMessage(messages.nulltext));
              }
            }
            popupTexts.push(popupDef);
          }
        }
      });
      this._fetchData(evt, popupTexts, function() {
        if (popupTexts.length || me._noFeaturesFound) {
          if (popupTexts.length === 0) {
            popupTexts.push(formatMessage(messages.nofeatures));
          }
          me.setState({
            popupTexts: popupTexts,
            contentAsObject: me._contentAsObject
          });
          me.setVisible(true);
          me.overlayPopup.setPosition(coord);
        } else {
          me.setVisible(false);
        }
      });
    }
  }
  render() {
    var contentDiv;
    if (this.state.contentAsObject) {
      contentDiv = (<div className='popup-content' ref='content'>{this.state.popupTexts}</div>);
    } else {
      var content = this.state.popupTexts.join('<hr>');
      contentDiv = (<div className='popup-content' ref='content' dangerouslySetInnerHTML={{__html: content}}></div>);
    }
    return (
      <div {...this.props} className={classNames('sdk-component info-popup', this.props.className)}>
        <IconButton style={{float: 'right'}} ref="popupCloser" onTouchTap={this.setVisible.bind(this, false)}><CloserIcon /></IconButton>
        {contentDiv}
      </div>
    );
  }
}

InfoPopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Should we show feature info on hover instead of on click?
   */
  hover: React.PropTypes.bool,
  /**
   * Format to use for WMS GetFeatureInfo requests.
   */
  infoFormat: React.PropTypes.string,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

InfoPopup.defaultProps = {
  hover: false,
  infoFormat: 'text/plain'
};

export default injectIntl(InfoPopup);
