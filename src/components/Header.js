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
import AppBar from 'material-ui/AppBar';
import Logo from './Logo';

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
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * Logo height
     */
    logoHeight: React.PropTypes.number,
    /**
    * Array of menu items to add to the header
    */
    leftMenuItems: React.PropTypes.node,
    /**
     * Image file to be used for logo
     */
    logo: React.PropTypes.string,
    /**
    * @ignore
    * Callback for left Icon
    **/
    onLeftIconTouchTap: React.PropTypes.func,
    /**
     * Determines if the left icon will display next to the title.
     */
    showLeftIcon: React.PropTypes.bool,
    /**
     * Child nodes
     */
    children: React.PropTypes.node
  };
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    showLeftIcon: true
  }

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
    var title
    if (this.props.logo) {
      title = (<Logo src={this.props.logo}
        logoHeight={this.props.logoHeight}
        onTouchTap={this.props.onLeftIconTouchTap}
        visible={this.props.showLeftIcon}
        tooltip={this.props.title}/>);
    } else {
      title = this.props.title;
    }
    var old =  (
      <AppBar
          style={this.props.style}
          showMenuIconButton={this.props.showLeftIcon}
          title={title}
          iconElementRight={
            <div>
              {this.props.children}
            </div>
          }
          onLeftIconButtonTouchTap={this.props.onLeftIconTouchTap}
        />
    );
    return (
      <div className="sdk-component header sdk-appbar sdk-container-fluid sdk--z1">
        <nav className="appbar sdk--appbar-height">
          <div className="header-left sdk--text-title">
            <span className="sidedrawer-toggle"><i className="fa fa-bars"></i></span>
            <span className="header-title">{title}</span>
          </div>
          <div className="header-right">
            <span className="nav-menu"><i className="fa fa-ellipsis-v"></i></span>
            <span className="header-actions">{this.props.children}</span>
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;
