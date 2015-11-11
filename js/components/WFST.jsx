import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerSelector from './LayerSelector.jsx';
import LayerStore from '../stores/LayerStore.js';
import MapTool from './MapTool.js';
import Pui from 'pui-react-alerts';
import UI from 'pui-react-buttons';

const messages = defineMessages({
  layerlabel: {
    id: 'wfst.layerlabel',
    description: 'Label for the layer combo box',
    defaultMessage: 'Layer'
  },
  drawfeature: {
    id: 'wfst.drawfeature',
    description: 'Button text for draw new feature',
    defaultMessage: 'Draw',
  },
  modifyfeature: {
    id: 'wfst.modifyfeature',
    description: 'Button text for modify / select existing feature',
    defaultMessage: 'Modify / Select',
  },
  deletefeature: {
    id: 'wfst.deletefeature',
    description: 'Button text for delete selected feature',
    defaultMessage: 'Delete',
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
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.SELECT_LAYER:
          if (action.cmp === this.refs.layerSelector) {
            this._setLayer(action.layer);
          }
          break;
        default:
          break;
      }
    });
    this.state = {
      error: false
    };
    this._interactions = {};
    this._select = new ol.interaction.Select();
    var features = this._select.getFeatures();
    this._modify = new ol.interaction.Modify({
      features: features
    });
    features.on('add', this._onSelectAdd, this);
    features.on('remove', this._onSelectRemove, this);
    this._dirty = {};
    this._format = new ol.format.WFS();
    this._serializer = new XMLSerializer();
  }
  componentDidMount() {
    var layerId = ReactDOM.findDOMNode(this.refs.layerSelector).value;
    this._setLayer(LayerStore.findLayer(layerId));
  }
  _setLayer(layer) {
    this._layer = layer;
     var layers = LayerStore.getState().flatLayers;
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      if (layers[i].get('isWFST')) {
        layers[i].setVisible(layers[i] === this._layer);
      }
    }
  }
  _modifyFeature() {
    this.deactivate();
    this.activate([this._select, this._modify]);
  }
  _deleteFeature() {
    var wfsInfo = this._layer.get('wfsInfo');
    var features = this._select.getFeatures();
    if (features.getLength() === 1) {
      var feature = features.item(0);
      // TODO have a confirm dialog?
      var node = this._format.writeTransaction(null, null, [feature], {
        featureNS: wfsInfo.featureNS,
        featureType: wfsInfo.featureType
      });
      this._doPOST(this._serializer.serializeToString(node),
        function(xmlhttp) {
          var data = xmlhttp.responseText;
          var result = this._readResponse(data);
          if (result && result.transactionSummary.totalDeleted === 1) {
            this._select.getFeatures().clear();
            this._layer.getSource().removeFeature(feature);
          } else {
            // TODO i18n
            this.setState({
              error: true,
              msg: 'There was an issue deleting the feature.'
            });
          }
        },
        function(xmlhttp) {
          this.setState({
            error: true,
            msg: xmlhttp.status + ' ' + xmlhttp.statusText
          });
        },
        this
      );
    }
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
            msg: xmlhttp.status + ' ' + xmlhttp.statusText
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
      },
      function(xmlhttp) {
        this.deactivate();
        var errorMsg = xmlhttp ? (xmlhttp.status + ' ' + xmlhttp.statusText) : '';
        this.setState({
          error: true,  
          msg: errorMsg
        });
      },
      this
    );
  }
  _drawFeature() {
    var layerId = this._layer.get('id');
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
    this.activate([draw]);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    return (
      <form onSubmit={this._onSubmit} role='form'>
        <label htmlFor='layerSelector'>{formatMessage(messages.layerlabel)}</label>
        <LayerSelector id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} />
        <UI.DefaultButton onClick={this._drawFeature.bind(this)}>{formatMessage(messages.drawfeature)}</UI.DefaultButton>
        <UI.DefaultButton onClick={this._modifyFeature.bind(this)}>{formatMessage(messages.modifyfeature)}</UI.DefaultButton>
        <UI.DefaultButton onClick={this._deleteFeature.bind(this)}>{formatMessage(messages.deletefeature)}</UI.DefaultButton>
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
