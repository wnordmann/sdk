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
import ol from 'openlayers';
import Button from './Button';
import classNames from 'classnames';
import NorthIcon from 'material-ui/svg-icons/maps/navigation';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

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
 * <Rotate map={map} />
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
     * Style for the buttons.
     */
    style: React.PropTypes.object,
    /**
     * The ol3 map to use.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
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
    autoHide: true,
    duration: 250
  };

  constructor(props, context) {
    super(props);
    this.state = {
      rotation: 0
    };
  }
  componentDidMount() {
    var view = this.props.map.getView();
    this.setState({
      rotation: view.getRotation()
    });
    view.on('change:rotation', function() {
      this.setState({rotation: view.getRotation()});
    }, this);
  }
  _resetNorth() {
    var map = this.props.map;
    var view = map.getView();
    var currentRotation = view.getRotation();
    if (currentRotation !== 0) {
      if (this.props.duration > 0) {
        view.animate({
          rotation: 0,
          duration: this.props.duration,
          easing: ol.easing.easeOut
        });
      } else {
        view.setRotation(0);
      }
    }
  }
  render() {
    if (this.state.rotation === 0 && this.props.autoHide) {
      return (<article/>);
    } else {
      const {formatMessage} = this.props.intl;
      var iconStyle = {
        transform: 'rotate(' + this.state.rotation + 'rad)'
      };
      return (
        <Button tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} secondary={true} className={classNames('sdk-component rotate', this.props.className)} iconStyle={iconStyle} tooltip={formatMessage(messages.rotatetitle)} onTouchTap={this._resetNorth.bind(this)}><NorthIcon /></Button>
      );
    }
  }
}

export default injectIntl(Rotate);
