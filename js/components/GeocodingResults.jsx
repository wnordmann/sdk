/*
Copyright 2016 Boundless, http://boundlessgeo.com
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License
*/

import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import GeocodingConstants from '../constants/GeocodingConstants.js';
import pureRender from 'pure-render-decorator';
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
@pureRender
class GeocodingResults extends React.Component {
  constructor(props) {
    super(props);
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case GeocodingConstants.SHOW_SEARCH_RESULTS:
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
      title: null,
      managed: false,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.75,
          src: this.props.markerUrl
        })
      }),
      source: new ol.source.Vector()
    });
    this.props.map.addLayer(this._layer);
  }
  _setVisible(visible) {
    ReactDOM.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
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
    var feature = new ol.Feature({
      geometry: new ol.geom.Point(center)
    });
    if (result.icon) {
      feature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
          src: result.icon
        })
      }));
    }
    source.addFeature(feature);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var me = this;
    var resultNodes;
    if (this.state.searchResults !== null) {
      if (this.state.searchResults.length > 0) {
        resultNodes = this.state.searchResults.map(function(result) {
          return (
            <a href='#' target='_self' key={result.place_id}><li key={result.place_id} onClick={me._zoomTo.bind(me, result)}>{result.display_name}</li></a>
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
   * Url to the marker image to use for bookmark position.
   */
  markerUrl: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

GeocodingResults.defaultProps = {
  zoom: 10,
  markerUrl: './resources/marker.png'
};

export default injectIntl(GeocodingResults);
