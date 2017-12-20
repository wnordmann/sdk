/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/** @module components/map/mouseposition
 * @example
 * import SdkMousePosition from '@boundlessgeo/sdk/components/map/mouseposition';
 * import { Provider } from 'react-redux';
 * import SdkMap from '@boundlessgeo/sdk/components/map';
 * import ReactDOM from 'react-dom';
 *
 * ReactDOM.render(<Provider store={store}>
 *   <SdkMap>
 *     <SdkMousePosition />
 *   </SdkMap>
 * </Provider>, document.getElementById('map'));
 *
 * @desc Shows the position of the mouse in geographic coordinates.
 */
class MousePosition extends React.Component {
  render() {
    let className = 'sdk-mouseposition';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    if (this.props.mapinfo.mouseposition.lngLat !== null) {
      return (
        <div className={className} style={this.props.style}>
          Longitude: {this.props.mapinfo.mouseposition.lngLat.lng}<br/>
          Latitude: {this.props.mapinfo.mouseposition.lngLat.lat}
        </div>
      );
    } else {
      return false;
    }
  }
}

MousePosition.propTypes = {
  /**
   * Css className for the root div.
   */
  className: PropTypes.string,
  /**
   * Style config object for root div.
   */
  style: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    mapinfo: state.mapinfo,
  };
}

export default connect(mapStateToProps)(MousePosition);
