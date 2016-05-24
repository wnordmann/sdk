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
import IconButton from 'material-ui/lib/icon-button';
import NorthIcon from 'material-ui/lib/svg-icons/maps/navigation';
import pureRender from 'pure-render-decorator';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  rotatetitle: {
    id: 'rotate.rotatetitle',
    description: 'Title for the reset rotation button',
    defaultMessage: 'Reset rotation'
  }
});

/**
 * Two buttons to zoom in and out.
 *
 * ```html
 * <div id='zoom-buttons'>
 *   <Zoom map={map} />
 * </div>
 * ```
 */
@pureRender
class Rotate extends React.Component {
  constructor(props) {
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
        currentRotation = currentRotation % (2 * Math.PI);
        if (currentRotation < -Math.PI) {
          currentRotation += 2 * Math.PI;
        }
        if (currentRotation > Math.PI) {
          currentRotation -= 2 * Math.PI;
        }
        map.beforeRender(ol.animation.rotate({
          rotation: currentRotation,
          duration: this.props.duration,
          easing: ol.easing.easeOut
        }));
      }
      view.setRotation(0);
    }
  }
  render() {
    if (this.state.rotation === 0) {
      return (<article/>);
    } else {
      const {formatMessage} = this.props.intl;
      var iconStyle = {
        transform: 'rotate(' + this.state.rotation + 'rad)'
      };
      return (
        <IconButton className='sdk-component rotate' tooltipPosition='top-left' iconStyle={iconStyle} style={this.props.style} tooltip={formatMessage(messages.rotatetitle)} onTouchTap={this._resetNorth.bind(this)}><NorthIcon color="white"/></IconButton>
      );
    }
  }
}

Rotate.propTypes = {
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Rotate.defaultProps = {
  duration: 250,
  style: {
    background: 'rgba(0,60,136,.7)',
    borderRadius: '2px',
    width: '28px',
    height: '28px',
    padding: '2px'
  }
};

export default injectIntl(Rotate);
