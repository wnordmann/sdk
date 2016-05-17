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
import ZoomIn from 'material-ui/lib/svg-icons/action/zoom-in';
import ZoomOut from 'material-ui/lib/svg-icons/action/zoom-out';
import pureRender from 'pure-render-decorator';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  zoomintitle: {
    id: 'zoom.zoomintitle',
    description: 'Title for the zoom in button',
    defaultMessage: 'Zoom in'
  },
  zoomouttitle: {
    id: 'zoom.zoomouttitle',
    description: 'Title for the zoom out button',
    defaultMessage: 'Zoom out'
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
class Zoom extends React.Component {
  _zoomIn() {
    this._zoomByDelta(this.props.delta);
  }
  _zoomOut() {
    this._zoomByDelta(-this.props.delta);
  }
  _zoomByDelta(delta) {
    var map = this.props.map;
    var view = map.getView();
    var currentResolution = view.getResolution();
    if (currentResolution) {
      if (this.props.duration > 0) {
        map.beforeRender(ol.animation.zoom({
          resolution: currentResolution,
          duration: this.props.duration,
          easing: ol.easing.easeOut
        }));
      }
      var newResolution = view.constrainResolution(currentResolution, delta);
      view.setResolution(newResolution);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <div>
        <IconButton tooltipPosition='top-right' style={this.props.style} tooltip={formatMessage(messages.zoomintitle)} onTouchTap={this._zoomIn.bind(this)}><ZoomIn color="white"/></IconButton><br/>
        <IconButton tooltipPosition='top-right' style={this.props.style} tooltip={formatMessage(messages.zoomouttitle)} onTouchTap={this._zoomOut.bind(this)}><ZoomOut color="white"/></IconButton>
      </div>
    );
  }
}

Zoom.propTypes = {
  /**
   * Animation duration in milliseconds.
   */
  duration: React.PropTypes.number,
  /**
   * The zoom delta applied on each click.
   */
  delta: React.PropTypes.number,
  /**
   * Style for the buttons.
   */
  style: React.PropTypes.object,
  /**
   * The ol3 map to use for zooming.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Zoom.defaultProps = {
  delta: 1,
  duration: 250,
  style: {
    background: 'rgba(0,60,136,.7)',
    borderRadius: '2px',
    width: '28px',
    height: '28px',
    padding: '2px'
  }
};

export default injectIntl(Zoom);
