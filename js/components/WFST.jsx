import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LayerSelector from './LayerSelector.jsx';
import LayerStore from '../stores/LayerStore.js';
import MapTool from './MapTool.js';
import Grids from 'pui-react-grids';
import Pui from 'pui-react-alerts';
import UI from 'pui-react-buttons';

const messages = defineMessages({
  layerlabel: {
    id: 'wfst.layerlabel',
    description: 'Label for the layer combo box',
    defaultMessage: 'Layer'
  },
  enable: {
    id: 'wfst.enable',
    description: 'Button text to enable edit mode',
    defaultMessage: 'Enable edit mode'
  },
  disable: {
    id: 'wfst.disable',
    description: 'Button text to disable edit mode',
    defaultMessage: 'Disable edit mode'
  },
  errormsg: {
    id: 'wfst.errormsg',
    description: 'Error message to show the user when a request fails',
    defaultMessage: 'Error saving this feature to GeoServer. {msg}'
  }
});

class WFST extends MapTool {
  constructor(props) {
    super(props);
    this.state = {
      enable: true,
      error: false
    };
    this._interactions = {};
    this._select = new ol.interaction.Select();
    var features = this._select.getFeatures();
    this._modify = new ol.interaction.Modify({
      features: features
    });
    this._hasDraw = false;
    features.on('add', this._onSelectAdd, this);
    features.on('remove', this._onSelectRemove, this);
    this._dirty = {};
    this._format = new ol.format.WFS();
    this._serializer = new XMLSerializer();
  }
  _modifyFeature() {
    this._setLayer();
    this.deactivate();
    this.activate([this._select, this._modify]);
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _filterLayerList(lyr) {
    return lyr.get('isWFST');
  }
  _onSelectAdd(evt) {
    var feature = evt.element;
    feature.on('change', function(evt) {
      this._dirty[evt.target.getId()] = true;
    }, this);
  }
  _onSelectRemove(evt) {
    var feature = evt.element;
    var wfsInfo = this._layer.get('wfsInfo');
    var fid = feature.getId();
    if (this._dirty[fid]) {
      var featureGeometryName = feature.getGeometryName();
      // do a WFS transaction to update the geometry
      var properties = feature.getProperties();
      // get rid of bbox which is not a real property
      delete properties.bbox;
      if (wfsInfo.geometryName !== featureGeometryName) {
        properties[wfsInfo.geometryName] = properties[featureGeometryName];
        delete properties[featureGeometryName];
      }
      var clone = new ol.Feature(properties);
      clone.setId(fid);
      if (wfsInfo.geometryName !== featureGeometryName) {
        clone.setGeometryName(wfsInfo.geometryName);
      }
      var node = this._format.writeTransaction(null, [clone], null, {
        gmlOptions: {
          srsName: this.props.map.getView().getProjection().getCode()
        },
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      this._doPOST(this._serializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalUpdated === 1) {
            delete this._dirty[fid];
          }
        },
        function(xmlhttp) {
          this.setState({
            error: true,
            msg: xmlhttp.status + ' ' + xmlhttp.statusText,
            enable: true
          });
        },
        this
      );
    }
  }
  _doPOST(data, success, failure, scope) {
    var xmlhttp = new XMLHttpRequest();
    var url = this._layer.get('wfsInfo').url;
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "text/xml");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          success.call(scope, xmlhttp);
        } else {
          failure.call(scope, xmlhttp);
        }
      }
    };
    xmlhttp.send(data);
  }
  _readResponse(data) {
    var result;
    if (global.Document && data instanceof global.Document && data.documentElement &&
      data.documentElement.localName == 'ExceptionReport') {
        this.setState({
          error: true,
          msg: data.getElementsByTagNameNS('http://www.opengis.net/ows', 'ExceptionText').item(0).textContent
        });
    } else {
      result = this._format.readTransactionResponse(data);
    }
    return result;
  }
  _onDrawEnd(evt) {
    var wfsInfo = this._layer.get('wfsInfo');
    var feature = evt.feature;
    var node = this._format.writeTransaction([feature], null, null, {
      gmlOptions: {
        srsName: this.props.map.getView().getProjection().getCode()
      },
      featureNS: wfsInfo.featureNS,
      featureType: wfsInfo.featureType
    });
    this._doPOST(this._serializer.serializeToString(node),
      function(xmlhttp) {
        var data = xmlhttp.responseText;
        var result = this._readResponse(data);
        if (result) {
          var insertId = result.insertIds[0];
          if (insertId == 'new0') {
            // reload data if we're dealing with a shapefile store
            this._layer.getSource().clear();
          } else {
            feature.setId(insertId);
          }
        }
        this._disableEditMode();
        this._hasDraw = false;
      },
      function(xmlhttp) {
        this.deactivate();
        this._hasDraw = false;
        var errorMsg = xmlhttp ? (xmlhttp.status + ' ' + xmlhttp.statusText) : '';
        this.setState({
          error: true,  
          msg: errorMsg,
          enable: true
        });
      },
      this
    );
  }
  _setLayer() {
    var layerId = ReactDOM.findDOMNode(this.refs.layerSelector).value;
    var layer = LayerStore.findLayer(layerId);
    this._layer = layer;
    return layerId;
  }
  _activate() {
    var layerId = this._setLayer();
    var wfsInfo = this._layer.get('wfsInfo');
    var source = this._layer.getSource();
    if (!this._interactions[layerId]) {
      this._interactions[layerId] = {
        draw:  new ol.interaction.Draw({
          source: source,
          type: wfsInfo.geometryType,
          geometryName: wfsInfo.geometryName
        })
      };
      this._interactions[layerId].draw.on('drawend', this._onDrawEnd, this);
    }
    var draw = this._interactions[layerId].draw;
    this.deactivate();
    this.activate([draw/*, this._modify, this._select*/]);
  } 
  _disableEditMode() {
    this.setState({enable: true});
    this.deactivate();
  }
  _enableEditMode() {
    this.setState({enable: false});
    this._activate();
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    var button;
    if (this.state.enable === true) {
      button = (<UI.DefaultButton onClick={this._enableEditMode.bind(this)}>{formatMessage(messages.enable)}</UI.DefaultButton>);
    } else {
      button = (<UI.DefaultButton onClick={this._disableEditMode.bind(this)}>{formatMessage(messages.disable)}</UI.DefaultButton>);
    }
    return (
      <form onSubmit={this._onSubmit} role="form" className='form-horizontal'>
        <div className="form-group">
          <Grids.Col md={6}><label htmlFor='layerSelector'>{formatMessage(messages.layerlabel)}</label></Grids.Col>
          <Grids.Col md={18}><LayerSelector id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} /></Grids.Col>
        </div>
        <div className='form-group'>
          {button}
          <UI.DefaultButton onClick={this._modifyFeature.bind(this)}>Modify</UI.DefaultButton>
        </div>
        {error}
      </form>
    );
  }
}

WFST.propTypes = {
  /**
   * The ol3 map whose layers can be used for the WFS-T tool.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(WFST);
