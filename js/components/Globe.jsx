/* global Cesium */
import React from 'react';
import ol from 'openlayers';
global.ol = ol;
import olcs from 'ol3-cesium';

/**
 * Adds a button to toggle 3D mode.
 */
export default class Globe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      globe: false
    };
    var providerUrl = '//assets.agi.com/stk-terrain/world';
    if (this.props.map.getTarget()) {
      this._ol3d = new olcs.OLCesium({map: this.props.map});
      var scene = this._ol3d.getCesiumScene();
      scene.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: providerUrl
      });
    } else {
      this.props.map.on('change:target', function() {
        this._ol3d = new olcs.OLCesium({map: this.props.map});
        var scene = this._ol3d.getCesiumScene();
        scene.terrainProvider = new Cesium.CesiumTerrainProvider({
          url: providerUrl
        });
      }, this);
    }
  }
  _toggle() {
    this._ol3d.setEnabled(!this.state.globe);
    this.setState({globe: !this.state.globe});
  }
  render() {
    var text = this.state.globe ? '2D' : '3D';
    return (
      <button title={text} onClick={this._toggle.bind(this)}>{text}</button>
    );
  }
}

Globe.propTypes = {
  /**
   * The ol3 map instance to work on.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
