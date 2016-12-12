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
import Typography from 'material-ui/styles/typography';

class Label extends React.Component {
  static propTypes = {
    /**
     * Custom style
     */
    style: React.PropTypes.object,
    /**
     * Child nodes
     */
    children: React.PropTypes.node
  };

  constructor(props) {
    super(props);
  }
  render() {
    const {
      style,
      ...other
    } = this.props;

    const baseStyle = {
      'color':Typography.textLightBlack,
      'paddingTop':'4px',
      'paddingBottom':'4px',
      'display':'inline-block'
    }
    return (<div style={Object.assign({}, baseStyle, style)}>{this.props.children}</div>);
  }
}

export default Label;
