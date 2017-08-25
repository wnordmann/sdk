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

/** SDK map control Component
 */

import React from 'react';
import PropTypes from 'prop-types';

class mapControl extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    };
  }

  hide() {
    this.setState({ visible: false });
    this.props.onHide();
  }

  renderMapControl(children) {
    if (!this.state.visible) {
      return false;
    }

    return (
      <div className="sdk-map-component">
        <div id="sdk-map-component-container">
          { React.Children.only(children) }
        </div>
      </div>
    );
  }

  render() {
    return this.renderMapControl(this.props.children);
  }
}

mapControl.propTypes = {
  // this unused prop warning is ignored because the coordinate is
  //  a required prop to rightly render the popup on the map.
  // eslint-disable-next-line
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.arrayOf(PropTypes.element),
  ]),
  closeable: PropTypes.bool,
  onClose: PropTypes.func,
};

mapControl.defaultProps = {
  children: '',
  closeable: false,
  onClose: () => {
    // do nothing
  },
};

export default mapControl;
