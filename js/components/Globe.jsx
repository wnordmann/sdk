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

/* global Cesium */
import React from 'react';
import ol from 'openlayers';
global.ol = ol;
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import IconButton from 'material-ui/lib/icon-button';
import GlobeIcon from 'material-ui/lib/svg-icons/action/three-d-rotation';
import pureRender from 'pure-render-decorator';
import olcs from 'ol3-cesium';

const messages = defineMessages({
  maptext: {
    id: 'globe.maptext',
    description: 'Tooltip to show to switch to map (2D) mode',
    defaultMessage: 'Switch to map (2D)'
  },
  globetext: {
    id: 'globe.globetext',
    description: 'Tooltip to show to switch to globe (3D) mode',
    defaultMessage: 'Switch to globe (3D)'
  }
});

/**
 * Adds a button to toggle 3D mode.
 * The HTML page of the application needs to include a script tag to cesium:
 *
 * ```html
 * <script src="./resources/ol3-cesium/Cesium.js" type="text/javascript" charset="utf-8"></script>
 * ```
 *
 * ```html
 * <div ref='map' id='map'>
 *   <div id='globe-button' className='ol-unselectable ol-control'>
 *     <Globe map={map} />
 *   </div>
 * </div>
 * ```
 */
@pureRender
class Globe extends React.Component {
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
    const {formatMessage} = this.props.intl;
    var icon, tooltip;
    icon = <GlobeIcon color='#F58D50' />;
    if (this.state.globe) {
      tooltip = formatMessage(messages.maptext);
    } else {
      tooltip = formatMessage(messages.globetext);
    }
    return (
      <IconButton tooltip={tooltip} onTouchTap={this._toggle.bind(this)}>{icon}</IconButton>
    );
  }
}

Globe.propTypes = {
  /**
   * The ol3 map instance to work on.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Globe);
