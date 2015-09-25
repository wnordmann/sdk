/* global ol */
import React from 'react';
import './InfoPopup.css';

const ALL_ATTRS = '#AllAttributes';

export default class InfoPopup extends React.Component {
  constructor(props) {
    super(props);
    this.props.map.on('singleclick', function(evt) {
      this._onMapClick(evt);
    }, this);
    this._format = new ol.format.GeoJSON();
    this.state = {
      popupTexts: []
    };
  }
  componentDidMount() {
    this._overlayPopup = new ol.Overlay({
      autoPan: true,
      element: React.findDOMNode(this).parentNode
    });
    this.props.map.addOverlay(this._overlayPopup);
    // regular jsx onClick does not work when stopEvent is true
    var closer = React.findDOMNode(this.refs.popupCloser);
    var me = this;
    closer.onclick = function() {
      me._setVisible(false);
      return false;
    };
  }
  _forEachLayer(layers, layer) {
    if (layer instanceof ol.layer.Group) {
      layer.getLayers().forEach(function(groupLayer) {
        this._forEachLayer(layers, groupLayer);
      }, this);
    } else if (layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo') && layer.get('popupInfo') !== '') {
      layers.push(layer);
    }
  }
  _fetchData(evt, popupTexts, cb) {
    var map = this.props.map;
    var allLayers = [];
    this._forEachLayer(allLayers, map.getLayerGroup());
    var len = allLayers.length;
    var finishedQueries = 0;
    var finishedQuery = function(){
      finishedQueries++;
      if (len === finishedQueries) {
        cb();
      }
    };
    var geojsonFormat = this._format, xmlhttp, method, url, view = map.getView();
    var resolution = view.getResolution(), projection = view.getProjection();
    var onReadyAll = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        popupTexts.push(xmlhttp.responseText);
        finishedQuery();
      }
    };
    var onReady = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        var features = geojsonFormat.readFeatures(xmlhttp.responseText);
        if (features.length) {
          var popupContent;
          for (var j = 0, jj = features.length; j < jj; ++j) {
            popupContent = popupDef;
            var feature = features[j];
            var values = feature.getProperties();
            for (var key in values) {
              var value = values[key];
              if (value) {
                popupContent = popupContent.replace('[' + key + ']', value);
              } else {
                popupContent = popupContent.replace('[' + key + ']', 'NULL');
              }
            }
          }
          popupTexts.push(popupContent);
        } else {
          popupTexts.push('No features at this location');
        }
        finishedQuery();
      }
    };
    for (var i = 0; i < len; i++) {
      var layer = allLayers[i];
      var popupDef = layer.get('popupInfo');
      if (popupDef === ALL_ATTRS) {
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': 'text/plain'
          }
        );
        xmlhttp = new XMLHttpRequest();
        method = 'GET';
        xmlhttp.open(method, url, true);
        xmlhttp.onreadystatechange = onReadyAll;
        xmlhttp.send();
      } else {
        url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          resolution,
          projection, {
            'INFO_FORMAT': 'application/json'
          }
        );
        xmlhttp = new XMLHttpRequest();
        method = 'GET';
        xmlhttp.open(method, url, true);
        xmlhttp.onreadystatechange = onReady;
        xmlhttp.send();
      }
    }
  }
  _onMapClick(evt) {
    var map = this.props.map;
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupTexts = [];
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
              popupDef = popupDef.replace('[' + featureKeys[i] + ']', 'NULL');
            }
          }
        }
        if (popupDef) {
          popupTexts.push(popupDef);
        }
      }
    });
    var me = this;
    this._fetchData(evt, popupTexts, function() {
      if (popupTexts.length) {
        me._overlayPopup.setPosition(coord);
        me.setState({
          popupTexts: popupTexts
        });
        me._setVisible(true);
      } else {
        me._setVisible(false);
      }
    });
  }
  _setVisible(visible) {
    React.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
  }
  render() {
    var content = this.state.popupTexts.join('<hr>');
    return (
      <article>
        <a href="#" ref="popupCloser" className="fa fa-times fa-pull-right"></a>
        <div id='popup-content' ref='content' dangerouslySetInnerHTML={{__html: content}}></div>
      </article>
    );
  }
}

InfoPopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
