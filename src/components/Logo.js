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
import classNames from 'classnames';

/**
 * Web Page Logo
 *
 * ```xml
 * <Logo src='logo.gif' />
 * ```
 */
class Logo extends React.PureComponent {
  static propTypes = {
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * Css class name.
     */
    className: React.PropTypes.string,
    /**
     * Source of the image file
     */
    src: React.PropTypes.string,
    /**
     * The tooltip to show.
     */
    tooltip: React.PropTypes.string,
    /**
     * Function to execute when clicked.
     */
    onTouchTap: React.PropTypes.func
  };
  static defaultProps = {
    tooltipPosition: 'bottom'
  };
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  render() {
    var className = {
      'sdk-component': true,
      'sdk-logo': true
    };
    className['hint--' + this.props.tooltipPosition] = this.props.tooltip !== undefined;
    return  (
      <span
        onTouchTap={this.props.onTouchTap}
        className={classNames(className, this.props.className)}
        aria-label={this.props.tooltip}
        title={this.props.tooltip}>
        <img src={this.props.src}  style={{marginTop: 12, height: 40}} />
      </span>)
  }
}

export default Logo;
