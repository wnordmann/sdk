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
import Button from './Button';
import Paper from 'material-ui/Paper';
import pureRender from 'pure-render-decorator';

/**
 * A component that shows a panel on click of a button.
 *
 * ```xml
 * <PanelButton className='legenddiv' contentClassName='legendcontent' buttonClassName='legend-button' icon={<LegendIcon />} tooltipPosition='top-left' buttonTitle='Show legend' map={map} content={<Legend map={map} />}/>
 * ```
 */
@pureRender
class PanelButton extends React.Component {
  static propTypes = {
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

  static defaultProps = {
    showExpandedOnStartup: false,
    buttonClassName: 'panelbutton',
    contentClassName: 'panel-button-panel'
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.showExpandedOnStartup
    };
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
  render() {
    var divClass = {
      'sdk-component': true,
      'panel-button': true
    };
    return (
      <div className={classNames(divClass, this.props.className)}>
        <Button buttonType='Action' mini={true} secondary={true} tooltipPosition={this.props.tooltipPosition} className={this.props.buttonClassName} tooltip={this.props.buttonTitle} onTouchTap={this._togglePanel.bind(this)}>{this.props.icon}</Button>
        <Paper zDepth={0} style={{display: this.state.visible ? 'block' : 'none'}} className={this.props.contentClassName}>{this.props.content}</Paper>
      </div>
    );
  }
}

export default PanelButton;
