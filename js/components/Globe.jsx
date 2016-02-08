/*
Copyright 2016 Boundless, http://boundlessgeo.com
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License
*/

/* global Cesium */
import React from 'react';
import ol from 'openlayers';
global.ol = ol;
import pureRender from 'pure-render-decorator';
import olcs from 'ol3-cesium';

/**
 * Adds a button to toggle 3D mode.
 */
@pureRender
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
      this.props.map.once('change:target', function() {
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
