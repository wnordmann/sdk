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
import Dialog from 'pui-react-modals';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LoginConstants from '../constants/LoginConstants.js';
import FeatureStore from '../stores/FeatureStore.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {doGET} from '../util.js';
import Grids from 'pui-react-grids';
import Pui from 'pui-react-alerts';
import pureRender from 'pure-render-decorator';
import {BasicInput} from 'pui-react-inputs';
import UI from 'pui-react-buttons';
import {Jsonix} from 'jsonix';
import {XSD_1_0} from '../../node_modules/w3c-schemas/lib/XSD_1_0.js';
import {XLink_1_0} from '../../node_modules/w3c-schemas/lib/XLink_1_0.js';
import {OWS_1_0_0} from '../../node_modules/ogc-schemas/lib/OWS_1_0_0.js';
import {Filter_1_1_0} from '../../node_modules/ogc-schemas/lib/Filter_1_1_0.js';
import {SMIL_2_0} from '../../node_modules/ogc-schemas/lib/SMIL_2_0.js';
import {SMIL_2_0_Language} from '../../node_modules/ogc-schemas/lib/SMIL_2_0_Language.js';
import {GML_3_1_1} from '../../node_modules/ogc-schemas/lib/GML_3_1_1.js';
import {WFS_1_1_0} from '../../node_modules/ogc-schemas/lib/WFS_1_1_0.js';
import './AddLayerModal.css';

const messages = defineMessages({
  title: {
    id: 'addwmslayermodal.title',
    description: 'Title for the modal Add layer dialog',
    defaultMessage: 'Add Layer'
  },
  errormsg: {
    id: 'addwmslayermodal.errormsg',
    description: 'Error message to show the user when a GetCapabilities request fails',
    defaultMessage: 'Error retrieving GetCapabilities. {msg}'
  },
  inputfieldlabel: {
    id: 'addwmslayermodal.inputfieldlabel',
    description: 'Label for input field',
    defaultMessage: '{serviceType} Endpoint'
  },
  connectbutton: {
    id: 'addwmslayermodal.connectbutton',
    description: 'Text for connect button',
    defaultMessage: 'Connect'
  }
});

const wmsCapsFormat = new ol.format.WMSCapabilities();
const geojsonFormat = new ol.format.GeoJSON();
const wfsContext = new Jsonix.Context([OWS_1_0_0, Filter_1_1_0, SMIL_2_0, SMIL_2_0_Language, XLink_1_0, GML_3_1_1, WFS_1_1_0]);
const wfsUnmarshaller = wfsContext.createUnmarshaller();
const xsdContext = new Jsonix.Context([XSD_1_0]);
const xsdUnmarshaller = xsdContext.createUnmarshaller();

/**
 * Modal window to add layers from a WMS or WFS service.
 */
@pureRender
class AddLayerModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      layers: []
    };
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LoginConstants.LOGIN:
          me._updateLayers();
          break;
        case LoginConstants.LOGOUT:
          me._updateLayers();
          break;
        default:
          break;
      }
    });
  }
  componentDidMount() {
    this._getCaps(this._getCapabilitiesUrl(this.props.url));
  }
  _getCaps(url) {
    var layers = [];
    this.setState({error: false});
    doGET(url, function(xmlhttp) {
      var info, layer;
      if (this.props.asVector) {
        info = wfsUnmarshaller.unmarshalDocument(xmlhttp.responseXML).value;
        if (info && info.featureTypeList && info.featureTypeList.featureType) {
          for (var i = 0, ii = info.featureTypeList.featureType.length; i < ii; ++i) {
            var ft = info.featureTypeList.featureType[i];
            layer = {};
            layer.Name = ft.name.prefix + ':' + ft.name.localPart;
            layer.Title = ft.title;
            layer.Abstract = ft._abstract;
            layer.EX_GeographicBoundingBox = [ft.wgs84BoundingBox[0].lowerCorner[0], ft.wgs84BoundingBox[0].lowerCorner[1], ft.wgs84BoundingBox[0].upperCorner[0], ft.wgs84BoundingBox[0].upperCorner[1]];
            layers.push(layer);
          }
        }
        this.setState({layerInfo: {Title: info.serviceIdentification.title, Layer: layers}});
      } else {
        info = wmsCapsFormat.read(xmlhttp.responseText);
        this.setState({layerInfo: info.Capability.Layer});
      }
    }, function(xmlhttp) {
      this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
    }, this);
  }
  _updateLayers() {
    var me = this;
    // this needs a timeout for the cookie to be set apparently
    window.setTimeout(function() {
      me._getCaps(me._getCapabilitiesUrl(me.props.url));
    }, 500);
  }
  _setError(msg) {
    this.setState({
      error: true,
      msg: msg
    });
  }
  _getStyleName(olLayer) {
    var url = this.props.url;
    url = url.replace(/wms|ows|wfs/g, 'rest/layers/' + olLayer.get('id') + '.json');
    doGET(url, function(xmlhttp) {
      var styleInfo = JSON.parse(xmlhttp.responseText);
      olLayer.set('styleName', styleInfo.layer.defaultStyle.name);
    }, function(xmlhttp) {
      olLayer.set('canStyle', false);
    });
  }
  _getWfsInfo(layer, olLayer) {
    var me = this;
    // do a WFS DescribeFeatureType request to get wfsInfo
    var url = this._getServiceUrl(me.props.url);
    url = url.replace('wms', 'wfs') + 'service=WFS&request=DescribeFeatureType&version=1.0.0&typename=' + layer.Name;
    doGET(url, function(xmlhttp) {
      if (xmlhttp.responseText.indexOf('ServiceExceptionReport') === -1) {
        var schema = xsdUnmarshaller.unmarshalString(xmlhttp.responseText).value;
        var element = schema.complexType[0].complexContent.extension.sequence.element;
        var geometryType, geometryName;
        var attributes = [];
        for (var i = 0, ii = element.length; i < ii; ++i) {
          var el = element[i];
          if (el.type.namespaceURI === 'http://www.opengis.net/gml') {
            geometryName = el.name;
            var lp = el.type.localPart;
            geometryType = lp.replace('PropertyType', '');
          } else if (el.name !== 'boundedBy') {
            // TODO if needed, use attribute type as well
            attributes.push(el.name);
          }
        }
        attributes.sort(function(a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        this.set('wfsInfo', {
          featureNS: schema.targetNamespace,
          featurePrefix: layer.Name.split(':').shift(),
          featureType: schema.element[0].name,
          geometryType: geometryType,
          geometryName: geometryName,
          attributes: attributes,
          url: me.props.url.replace('wms', 'wfs')
        });
        if (this instanceof ol.layer.Tile) {
          FeatureStore.loadFeatures(this, 0);
        }
      }
    }, function(xmlhttp) { }, olLayer);
    // TODO handle failure
  }
  _onLayerClick(layer) {
    var map = this.props.map;
    var view = map.getView();
    var EX_GeographicBoundingBox = layer.EX_GeographicBoundingBox;
    if (view.getProjection().getCode() === 'EPSG:3857') {
      EX_GeographicBoundingBox[0] = Math.max(-180, EX_GeographicBoundingBox[0]);
      EX_GeographicBoundingBox[1] = Math.max(-85, EX_GeographicBoundingBox[1]);
      EX_GeographicBoundingBox[2] = Math.min(180, EX_GeographicBoundingBox[2]);
      EX_GeographicBoundingBox[3] = Math.min(85, EX_GeographicBoundingBox[3]);
    }
    var extent = ol.proj.transformExtent(layer.EX_GeographicBoundingBox, 'EPSG:4326', view.getProjection());
    var olLayer;
    if (this.props.asVector) {
      var me = this;
      olLayer = new ol.layer.Vector({
        title: layer.Title,
        id: layer.Name,
        isWFST: true,
        canStyle: true,
        source: new ol.source.Vector({
          url: function(extent) {
            return me.props.url.replace('wms', 'wfs') + 'service=WFS' +
              '&version=1.1.0&request=GetFeature&typename=' + layer.Name +
              '&outputFormat=application/json&srsname=EPSG:3857' +
              '&bbox=' + extent.join(',') + ',EPSG:3857';
          },
          format: geojsonFormat,
          strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
            maxZoom: 19
          }))
        })
      });
    } else {
      olLayer = new ol.layer.Tile({
        extent: extent,
        title: layer.Title,
        id: layer.Name,
        isRemovable: true,
        canStyle: true,
        wfsInfo: true,
        popupInfo: '#AllAttributes',
        source: new ol.source.TileWMS({
          url: this.props.url,
          params: {
            LAYERS: layer.Name,
            TILED: true
          },
          serverType: 'geoserver'
        })
      });
      this._getStyleName.call(this, olLayer);
    }
    this._getWfsInfo.call(this, layer, olLayer);
    map.addLayer(olLayer);
    if (!this.props.asVector) {
      view.fit(extent, map.getSize());
    }
    this.close();
  }
  _getServiceUrl(url) {
    if (url.indexOf('?') !== -1) {
      if (url.slice(-1) !== '?' && url.slice(-1) !== '&') {
        url += '&';
      }
    } else {
      url += '?';
    }
    return url
  }
  _getCapabilitiesUrl(url) {
    url = this._getServiceUrl(url);
    if (this.props.asVector) {
      url += 'service=WFS&VERSION=1.1.0&request=GetCapabilities';
    } else {
      url += 'service=WMS&request=GetCapabilities&version=1.3.0';
    }
    return url;
  }
  _connect() {
    var url = document.getElementById('url').value;
    this._getCaps(this._getCapabilitiesUrl(url));
  }
  _getLayersMarkup(layer) {
    var childList;
    if (layer.Layer) {
      var children = layer.Layer.map(function(child) {
        return this._getLayersMarkup(child);
      }, this);
      childList = (
        <ul className='addlayer'>
          {children}
        </ul>
      );
    }
    var markup;
    if (layer.Name) {
      markup = (<a className='layername' title={layer.Abstract || layer.Title} href="#" onClick={this._onLayerClick.bind(this, layer)}>{layer.Title}</a>);
    } else {
      markup = (<span>{layer.Title}</span>);
    }
    var className;
    if (layer.Layer) {
      className = 'fa fa-folder-open-o';
    } else if (layer.Name) {
      className = 'fa-file-o';
    }
    return (
      <li className={className} key={layer.Title}>
        {markup}
        {childList}
      </li>
    );
  }
  render() {
    const {formatMessage} = this.props.intl;
    var layers;
    if (this.state.layerInfo) {
      layers = this._getLayersMarkup(this.state.layerInfo);
    }
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    var input;
    if (this.props.allowUserInput) {
      var serviceType = this.props.asVector ? 'WFS' : 'WMS';
      input = (<div className="clearfix">
        <Grids.Col md={18}>
          <BasicInput label={formatMessage(messages.inputfieldlabel, {serviceType: serviceType})}  id='url' defaultValue={this.props.url} />
        </Grids.Col>
        <Grids.Col md={6} className='connect-button'>
          <UI.DefaultButton onClick={this._connect.bind(this)} ref="connectButton">{formatMessage(messages.connectbutton)}</UI.DefaultButton>
        </Grids.Col>
      </div>);
    }
    return (
      <Dialog.BaseModal title={formatMessage(messages.title)} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          {input}
          <ul className='addlayer'>
            {layers}
          </ul>
          {error}
        </Dialog.ModalBody>
      </Dialog.BaseModal>
    );
  }
}

AddLayerModal.propTypes = {
  /**
   * url that will be used to retrieve layers from (WMS or WFS).
   */
  url: React.PropTypes.string,
  /**
   * Should we add layers as vector? Will use WFS GetCapabilities.
   */
  asVector: React.PropTypes.bool,
  /**
   * Should be user be able to provide their own url?
   */
  allowUserInput: React.PropTypes.bool,
  /**
   * The srs name that the map's view is in.
   */
  srsName: React.PropTypes.string,
  /**
   * maxFeatures to use when retrieving features from a WMS layer.
   */
  maxFeatures: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

AddLayerModal.defaultProps = {
  asVector: false,
  allowUserInput: false,
  maxFeatures: 50
};

export default injectIntl(AddLayerModal, {withRef: true});
