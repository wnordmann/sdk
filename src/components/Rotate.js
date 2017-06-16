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
import Button from './Button';
import classNames from 'classnames';
import NorthIcon from 'material-ui/svg-icons/maps/navigation';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import {connect} from 'react-redux';

import * as MapActions from '../actions/MapActions';

const messages = defineMessages({
  rotatetitle: {
    id: 'rotate.rotatetitle',
    description: 'Title for the reset rotation button',
    defaultMessage: 'Reset rotation'
  }
});

/**
 * A button that shows the rotation of the map and allows to reset it.
 *
 * ```xml
 * <Rotate />
 * ```
 *
 * ![Rotate](../Rotate.png)
 */
class Rotate extends React.PureComponent {
  static propTypes = {
    /**
     * Animation duration in milliseconds.
     */
    duration: React.PropTypes.number,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * Should we hide the button if not rotated?
     */
    autoHide: React.PropTypes.bool,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * i18n message strings. Provided through the application through context.
     */
    intl: intlShape.isRequired
  };

  static defaultProps = {
    autoHide: false,
    duration: 250
  };

  _resetNorth() {
    var view = {rotation: 0};
    this.props.setView(view);
  }
  render() {
    // get the angle of the map
    let theta = 0;
    if (this.props.map && this.props.map.view && this.props.map.view.rotation) {
      theta = this.props.map.view.rotation;
    }
    // when autohide is enabled, do not render anything in the DOM.
    if (theta === 0 && this.props.autoHide) {
      return false;
    } else {
      const {formatMessage} = this.props.intl;
      var iconStyle = {
        transform: 'rotate(' + theta + 'rad)'
      };
      return (
        <Button style={this.props.style} tooltip={formatMessage(messages.rotatetitle)} tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} secondary={true} iconStyle={iconStyle} className={classNames('sdk-component rotate', this.props.className)}  onTouchTap={this._resetNorth.bind(this)}><NorthIcon /></Button>
      );
    }
  }
}

function mapPropsToState(state) {
  return {
    map: state.mapState
  }
}

function mapPropsToDispatch(dispatch) {
  return {
    setView: view => dispatch(MapActions.setView(view))
  }
}

export default connect(mapPropsToState, mapPropsToDispatch)(injectIntl(Rotate));
