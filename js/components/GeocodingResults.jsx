import React from 'react';
import ol from 'openlayers';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import MapConstants from '../constants/MapConstants.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  noresults: {
    id: 'geocodingresults.noresults',
    description: 'Text to show when no results were found',
    defaultMessage: 'No results found'
  }
});

/**
 * This component displays the results of geocoding search. The geocoding search is initiated by the Geocoding component.
 */
class GeocodingResults extends React.Component {
  constructor(props) {
    super(props);
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.SEARCH_RESULTS:
          me.setState({searchResults: action.searchResults});
          me._setVisible(true);
          break;
        default:
          break;
      }
    });
    this.state = {
      searchResults: null
    };
  }
  componentDidMount() {
    this._layer = new ol.layer.Vector({
      hideFromLayerList: true,
      managed: false,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.75,
          src: '../../resources/marker.png'
        })
      }),
      source: new ol.source.Vector()
    });
    this.props.map.addLayer(this._layer);
  }
  _setVisible(visible) {
    React.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
  }
  _zoomTo(result) {
    this._setVisible(false);
    var map = this.props.map;
    var center = [parseFloat(result.lon), parseFloat(result.lat)];
    center = ol.proj.transform(center, 'EPSG:4326', map.getView().getProjection());
    map.getView().setCenter(center);
    map.getView().setZoom(this.props.zoom);
    var source = this._layer.getSource();
    source.clear();
    source.addFeature(new ol.Feature({
        geometry: new ol.geom.Point(center)
    }));
  }
  render() {
    const {formatMessage} = this.props.intl;
    var me = this;
    var resultNodes;
    if (this.state.searchResults !== null) {
      if (this.state.searchResults.length > 0) {
        resultNodes = this.state.searchResults.map(function(result) {
          return (
            <a href='#' key={result.place_id}><li key={result.place_id} onClick={me._zoomTo.bind(me, result)}>{result.display_name}</li></a>
          );
        });
      } else {
        resultNodes = <p>{formatMessage(messages.noresults)}</p>;
      }
    }
    return (
      <ul>
       {resultNodes}
      </ul>
    );
  }
}

GeocodingResults.propTypes = {
  /**
   * The ol3 map on whose view to perform the center action.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The zoom level used when centering the view on a geocoding result.
   */
  zoom: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

GeocodingResults.defaultProps = {
  zoom: 10
};

export default injectIntl(GeocodingResults);
