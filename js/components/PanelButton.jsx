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
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Button from './Button.jsx';
import pureRender from 'pure-render-decorator';

/**
 * A component that shows a panel on click of a button.
 */
@pureRender
class PanelButton extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme(),
      visible: this.props.showExpandedOnStartup
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }
  _hidePanel() {
    this.setState({visible: false});
  }
  _showPanel() {
    this.setState({visible: true});
  }
  _togglePanel() {
    this.setState({visible: !this.state.visible});
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: Object.assign(this.props.style || {}, {
        background: rawTheme.palette.primary1Color
      })
    };
  }
  render() {
    const styles = this.getStyles();
    var divClass = {
      'sdk-component': true,
      'panel-button': true
    };
    return (
      <div className={classNames(divClass, this.props.className)}>
        <Button buttonType='Action' mini={true} secondary={true} tooltipPosition={this.props.tooltipPosition} style={styles.root} className={this.props.buttonClassName} tooltip={this.props.buttonTitle} onTouchTap={this._togglePanel.bind(this)}>{this.props.icon}</Button>
        <div style={{display: this.state.visible ? 'block' : 'none'}} className={this.props.contentClassName}>{this.props.content}</div>
      </div>
    );
  }
}

PanelButton.propTypes = {
  /**
   * Style for the button.
   */
  style: React.PropTypes.object,
  /**
   * Should we expand on startup of the application?
   */
  showExpandedOnStartup: React.PropTypes.bool,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Css class name to apply on the button.
   */
  buttonClassName: React.PropTypes.string,
  /**
   * Css class name to apply on the content div.
   */
  contentClassName: React.PropTypes.string,
  /**
   * Content to show in the div when the button is clicked.
   */
  content: React.PropTypes.node.isRequired,
  /**
   * Icon to use on the button.
   */
  icon: React.PropTypes.node.isRequired,
  /**
   * Tooltip to show on the button.
   */
  buttonTitle: React.PropTypes.string,
  /**
   * Position of the tooltip.
   */
  tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left'])
};

PanelButton.defaultProps = {
  showExpandedOnStartup: false,
  buttonClassName: 'panelbutton',
  contentClassName: 'panel-button-panel'
};

PanelButton.contextTypes = {
  muiTheme: React.PropTypes.object
};

PanelButton.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default PanelButton;
