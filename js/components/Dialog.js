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
import Paper from 'material-ui/Paper';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

export default class Dialog extends React.PureComponent {
  static propTypes = {
    inline: React.PropTypes.bool
  };

  static defaultProps = {
    inline: false
  };

  render() {
    if (this.props.inline) {
      const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex : 1,
        display: this.props.open ? 'block' : 'none'
      };
      return (<Paper className={this.props.className} style={style} zDepth={0}><Toolbar><ToolbarTitle text={this.props.title} /><ToolbarGroup><ToolbarSeparator /></ToolbarGroup><ToolbarGroup>{React.Children.toArray(this.props.actions)}</ToolbarGroup></Toolbar><Paper zDepth={0} style={{overflow: this.props.autoScrollBodyContent ? 'auto' : 'visible', height: 'calc(100% - 56px)'}}>{this.props.children}</Paper></Paper>);
    } else {
      return (<MuiDialog {...this.props} />);
    }
  }
}
