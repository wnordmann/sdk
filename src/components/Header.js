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
import {Menu, Popover, AppBar}from 'material-ui';
import IconButton from 'material-ui/IconButton';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
/**
 * A header toolbar for holding buttons
 *
 * ```xml
 * <StyleModal layer={this.props.layer} />
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
    * Map Save Callback
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

  handleToggle = () => {
    this.setState({
      menuOpen: !this.state.open
    });
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
            <div className="headerIcons">
              <IconButton
                 iconClassName="headerIcons ms ms-select-box"
                />
              <IconButton
                 iconClassName="headerIcons ms ms-measure-distance"
                />
              <IconButton onTouchTap={this.handleMenuTouchTap} >
                <NavigationMoreVert />
                <Popover
                  open={this.state.menuOpen}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  onRequestClose={this.handleMenuRequestClose}
                >
                  <Menu onItemTouchTap = { this.handleMenuChange } children={this.props.leftMenuItems}/>
                </Popover>
              </IconButton>
            </div>}
            onLeftIconButtonTouchTap={this.props.onLeftIconTouchTap}
        />
    );
  }
}

export default Header;
