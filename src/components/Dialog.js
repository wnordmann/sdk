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

/**
 * Intermediate class for dialogs. Allows components to use dialogs that can
 * easily switch between modal dialogs and inline dialogs (Drawer).
 */
export default class Dialog extends React.PureComponent {
  static propTypes = {
    /**
     * Css classname to use.
     */
    className: React.PropTypes.string,
    /**
     * Should the dialog show inline, or as a modal dialog?
     */
    inline: React.PropTypes.bool,
    /**
     * Function to call when dialog closes.
     */
    onRequestClose: React.PropTypes.func,
    /**
     * Title of the dialog.
     */
    title: React.PropTypes.string,
    /**
     * Should we auto scroll the content of the dialog body?
     */
    autoScrollBodyContent: React.PropTypes.bool,
    /**
     * Action buttons for the dialog.
     */
    actions: React.PropTypes.node,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * @ignore
     */
    children: React.PropTypes.node
  };

  static defaultProps = {
    inline: false,
    open: false
  };
  render() {
    if (this.props.inline) {
      return (
        <Drawer style={this.props.style} width={360} className={this.props.className} autoScrollBodyContent={this.props.autoScrollBodyContent} title={this.props.title} open={this.props.open} onRequestClose={this.props.onRequestClose}>
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
