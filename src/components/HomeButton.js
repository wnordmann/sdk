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
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import Button from './Button';
import HomeIcon from 'material-ui/svg-icons/maps/zoom-out-map';

const messages = defineMessages({
  buttontitle: {
    id: 'homebutton.buttontitle',
    description: 'Title for the home button',
    defaultMessage: 'Zoom to the initial extent'
  }
});

/**
 * A button to go back to the initial extent of the map.
 *
 * ```xml
 * <HomeButton map={map} />
 * ```
 *
 * ![Home Button](../HomeButton.png)
 */
class HomeButton extends React.PureComponent {
  static propTypes = {
    /**
     * The ol3 map for whose view the initial center and zoom should be restored.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * Extent to fit on the map on pressing this button. If not set, the initial extent of the map will be used.
     */
    extent: React.PropTypes.arrayOf(React.PropTypes.number),
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    if (!this.props.extent) {
      var view = this.props.map.getView();
      this._center = view.getCenter();
      this._resolution = view.getResolution();
      if (this._center === null) {
        view.once('change:center', function(evt) {
          this._center = evt.target.getCenter();
        }, this);
      }
      if (this._resolution === undefined) {
        view.once('change:resolution', function(evt) {
          this._resolution = evt.target.getResolution();
        }, this);
      }
    }
  }
  _goHome() {
    var view = this.props.map.getView();
    if (this.props.extent) {
      view.fit(this.props.extent, this.props.map.getSize(), {constrainResolution: false});
    } else if (this._center !== null && this._resolution !== undefined) {
      view.setCenter(this._center);
      view.setResolution(this._resolution);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <Button style={this.props.style} tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} secondary={true} className={classNames('sdk-component home-button', this.props.className)} tooltip={formatMessage(messages.buttontitle)} onTouchTap={this._goHome.bind(this)} ><HomeIcon /></Button>
    );
  }
}

export default injectIntl(HomeButton);
