/* global ol, Cesium */
import React from 'react';
import olcs from 'ol3-cesium';

export default class Globe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      globe: false
    };
    this._ol3d = new olcs.OLCesium({map: this.props.map});
    var scene = this._ol3d.getCesiumScene();
    scene.terrainProvider = new Cesium.CesiumTerrainProvider({
      url: '//cesiumjs.org/stk-terrain/tilesets/world/tiles'
    });
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
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
