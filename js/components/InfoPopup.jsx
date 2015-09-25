/* global ol */
import React from 'react';
import './InfoPopup.css';

export default class InfoPopup extends React.Component {
  constructor(props) {
    super(props);
    this.props.map.on('singleclick', function(evt) {
      this._onMapClick(evt);
    }, this);
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
              popupDef = popupDef.split('[' + featureKeys[i] + ']').join(feature.get(featureKeys[i]));
            } else {
              popupDef = popupDef.split('[' + featureKeys[i] + ']').join('NULL');
            }
          }
        }
        if (popupDef) {
          popupTexts.push(popupDef);
        }
      }
    });
    if (popupTexts.length) {
      this._overlayPopup.setPosition(coord);
      this.setState({
        popupTexts: popupTexts
      });
      this._setVisible(true);
    } else {
      this._setVisible(false);
    }
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
