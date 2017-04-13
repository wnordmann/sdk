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
import MuiDialog from 'material-ui/Dialog';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import Drawer from 'material-ui/Drawer';
import './Dialog.css';

export default class Dialog extends React.PureComponent {
  static propTypes = {
    className: React.PropTypes.string,
    inline: React.PropTypes.bool,
    onRequestClose: React.PropTypes.func,
    title: React.PropTypes.string,
    autoScrollBodyContent: React.PropTypes.bool,
    actions: React.PropTypes.node,
    children: React.PropTypes.node
  };

  static defaultProps = {
    inline: false,
    open: false
  };
  render() {
    if (this.props.inline) {
      return (
        <Drawer width={360} className={this.props.className} autoScrollBodyContent={this.props.autoScrollBodyContent} title={this.props.title} open={this.props.open} onRequestClose={this.props.onRequestClose}>
          <AppBar
            title={this.props.title}
            iconElementLeft={<IconButton> <NavigationArrowBack/> </IconButton>} onLeftIconButtonTouchTap={this.props.onRequestClose}/>
          <div className="noBorderPaper">
            {this.props.children}
          </div>
          <div className='footerButtons'>
            {React.Children.toArray(this.props.actions)}
          </div>
        </Drawer>
      );
    } else {
      return (<MuiDialog {...this.props} />);
    }
  }
}
