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
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import ToolUtil from '../toolutil.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import './BasePopup.css';

class BasePopup extends React.Component {
  constructor(props) {
    super(props);
    this._dispatchToken = ToolUtil.register(this);
  }
  componentDidMount() {
    this.overlayPopup = new ol.Overlay({
      autoPan: true,
      element: ReactDOM.findDOMNode(this).parentNode
    });
    this.props.map.addOverlay(this.overlayPopup);
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  activate(interactions) {
    this.active = true;
    // it is intentional not to call activate on ToolUtil here
  }
  deactivate() {
    this.active = false;
    // it is intentional not to call deactivate on ToolUtil here
  }
  setVisible(visible) {
    ReactDOM.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
    var me = this;
    // regular jsx onClick does not work when stopEvent is true
    var closer = ReactDOM.findDOMNode(this.refs.popupCloser);
    if (closer.onclick === null) {
      closer.onclick = function() {
        me.setVisible(false);
        return false;
      };
    }
  }
}

BasePopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};

export default BasePopup;
