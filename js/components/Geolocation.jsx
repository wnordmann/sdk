import React from 'react';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './Geolocation.css';
import pureRender from 'pure-render-decorator';
import Pui from 'pui-react-alerts';

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
  }
});

/**
 * Enable geolocation which uses the current position of the user in the map.
 */
@pureRender
class Geolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false
    };
  }
  _geolocate() {
    if (this._geolocation) {
      this._geolocation.setTracking(!this._geolocation.getTracking());
      this._featuresOverlay.setMap(this._geolocation.getTracking() ? this.props.map : null);
    } else {
      var map = this.props.map;
      this._geolocation = new ol.Geolocation({
        tracking: true,
        projection: map.getView().getProjection()
      });
      var accuracyFeature = new ol.Feature();
      this._geolocation.on('change:accuracyGeometry', function() {
        accuracyFeature.setGeometry(this._geolocation.getAccuracyGeometry());
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
        this.setState({error: true, msg: error.message});
      }, this);
      this._geolocation.on('change:position', function() {
        var coordinates = this._geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        map.getView().setCenter(coordinates);
      }, this);
      this._featuresOverlay = new ol.layer.Vector({
        map: map,
        useSpatialIndex: false,
        source: new ol.source.Vector({
          features: [accuracyFeature, positionFeature]
        })
      });
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.state.error) {
      return (<Pui.ErrorAlert dismissable={true} withIcon={true}>{formatMessage(messages.error, {details: this.state.msg})}</Pui.ErrorAlert>);
    } else {
      return (
        <button id='geolocation-button' title={formatMessage(messages.buttontitle)} onClick={this._geolocate.bind(this)}></button>
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Geolocation);
