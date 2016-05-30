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
import pureRender from 'pure-render-decorator';
import Snackbar from 'material-ui/lib/snackbar';
import IconButton from 'material-ui/lib/icon-button';
import MyLocation from 'material-ui/lib/svg-icons/maps/my-location';

const messages = defineMessages({
  error: {
    id: 'geolocation.error',
    description: 'Error text for when geolocation fails',
    defaultMessage: 'Error while retrieving geolocation, details: {details}'
  },
  buttontitle: {
    id: 'geolocation.buttontitle',
    description: 'Title for geolocation button',
    defaultMessage: 'Geolocation'
  },
  trackingtitle: {
    id: 'geolocation.trackingtitle',
    description: 'Title to add to the geolocation button when tracking is active',
    defaultMessage: 'Tracking'
  }
});

/**
 * Enable geolocation which uses the current position of the user in the map.
 *
 * ```xml
 * <div id='geolocation-control' className='ol-unselectable ol-control'>
 *   <Geolocation map={map} />
 * </div>
 * ```
 */
@pureRender
class Geolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      open: false,
      tracking: false
    };
  }
  _geolocate() {
    if (this._geolocation) {
      this._geolocation.setTracking(!this._geolocation.getTracking());
      if (this._geolocation.getTracking()) {
        this._hasBeenCentered = false;
      }
      this._featuresOverlay.getSource().clear();
      this._featuresOverlay.setVisible(this._geolocation.getTracking());
    } else {
      var map = this.props.map;
      this._geolocation = new ol.Geolocation({
        tracking: true,
        projection: map.getView().getProjection()
      });
      var accuracyFeature = new ol.Feature();
      this._geolocation.on('change:accuracyGeometry', function() {
        accuracyFeature.setGeometry(this._geolocation.getAccuracyGeometry());
        this._featuresOverlay.getSource().addFeature(accuracyFeature);
      }, this);
      var positionFeature = new ol.Feature();
      positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#3399CC'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
          })
        })
      }));
      this._geolocation.on('error', function(error) {
        this.setState({error: true, open: true, msg: error.message});
      }, this);
      this._geolocation.on('change:position', function() {
        var coordinates = this._geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        this._featuresOverlay.getSource().addFeature(positionFeature);
        if (!this._hasBeenCentered) {
          map.getView().setCenter(coordinates);
          this._hasBeenCentered = true;
        }
      }, this);
      this._featuresOverlay = new ol.layer.Vector({
        title: null,
        zIndex: 1000,
        source: new ol.source.Vector({wrapX: false})
      });
      map.addLayer(this._featuresOverlay);
    }
    this.setState({tracking: this._geolocation.getTracking()});
  }
  _handleRequestClose() {
    this.setState({
      open: false
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.state.error) {
      return (<Snackbar
        open={this.state.open}
        bodyStyle={{backgroundColor: 'rgba(255, 0, 0, 0.8)'}}
        message={formatMessage(messages.error, {details: this.state.msg})}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    } else {
      var color, tooltip = formatMessage(messages.buttontitle);
      if (this.state.tracking) {
        color = 'red';
        tooltip += ' (' + formatMessage(messages.trackingtitle) + ')';
      } else {
        color = 'white';
      }
      return (
        <IconButton {...this.props} className={classNames('sdk-component geolocation', this.props.className)} tooltipPosition='top-right' style={this.props.style} tooltip={tooltip} onTouchTap={this._geolocate.bind(this)}><MyLocation color={color} /></IconButton>
      );
    }
  }
}

Geolocation.propTypes = {
  /**
   * The ol3 map for which to change its view's center.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
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

Geolocation.defaultProps = {
  style: {
    background: 'rgba(0,60,136,.7)',
    borderRadius: '2px',
    width: '28px',
    height: '28px',
    padding: '2px'
  }
};

export default injectIntl(Geolocation);
