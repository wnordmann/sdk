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
import {AppBar}from 'material-ui';
import './Header.css';
/**
 * A header toolbar for holding buttons
 *
 * ```xml
 * <Header  />
 * ```
 */

class Header extends React.Component {
  static propTypes = {

    /**
     * Title of the Header
     */
    title: React.PropTypes.string,
    /**
    * Array of menu items to add to the header
    */
    leftMenuItems: React.PropTypes.node,
    /**
    * @ignore
    * Callback for left Icon
    **/
    onLeftIconTouchTap: React.PropTypes.func,
    /**
     * Child nodes
     */
    children: React.PropTypes.node
  };
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
  }

  state = {
    menuOpen: false
  };

  handleMenuTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget
    });
  };
  handleMenuRequestClose = () => {
    this.setState({
      menuOpen: false
    });
  };
  render() {
    return (
      <AppBar
          title={this.props.title}
          iconElementRight={
            <div>
              {this.props.children}
            </div>
          }
          onLeftIconButtonTouchTap={this.props.onLeftIconTouchTap}
        />
    );
  }
}

export default Header;
