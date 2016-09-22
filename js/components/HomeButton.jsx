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
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import classNames from 'classnames';
import Button from './Button.jsx';
import HomeIcon from 'material-ui/svg-icons/maps/zoom-out-map';
import pureRender from 'pure-render-decorator';

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
 * ```html
 * <div id='home-button'>
 *   <HomeButton map={map} />
 * </div>
 * ```
 */
@pureRender
class HomeButton extends React.Component {
  constructor(props, context) {
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
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme()
    };
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
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    return (
      <Button tooltipStyle={{'top':'-50px'}} buttonType='Action' mini={true} secondary={true} className={classNames('sdk-component home-button', this.props.className)} tooltipPosition='top-right' style={styles.root} tooltip={formatMessage(messages.buttontitle)} onTouchTap={this._goHome.bind(this)} ><HomeIcon /></Button>
    );
  }
}

HomeButton.propTypes = {
  /**
   * The ol3 map for whose view the initial center and zoom should be restored.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Extent to fit on the map on pressing this button. If not set, the initial extent of the map will be used.
   */
  extent: React.PropTypes.arrayOf(React.PropTypes.number),
  /**
   * Style for the button.
   */
  style: React.PropTypes.object,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

HomeButton.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(HomeButton);
