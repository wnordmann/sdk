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
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ol from 'openlayers';
import classNames from 'classnames';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import {List, ListItem} from 'material-ui/List';
import GeocodingConstants from '../constants/GeocodingConstants.js';
import GeocodingActions from '../actions/GeocodingActions.js';
import pureRender from 'pure-render-decorator';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './GeocodingResults.css';

const messages = defineMessages({
  noresults: {
    id: 'geocodingresults.noresults',
    description: 'Text to show when no results were found',
    defaultMessage: 'No results found'
  }
});

/**
 * This component displays the results of geocoding search. The geocoding search is initiated by the Geocoding component.
 *
 * ```xml
 *  <div id='geocoding-results' className='geocoding-results'>
 *    <GeocodingResults map={map} />
 *  </div>
 * ```
 */
@pureRender
class GeocodingResults extends React.Component {
  constructor(props, context) {
    super(props);
    var me = this;
    this._dispatchToken = AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case GeocodingConstants.SHOW_SEARCH_RESULTS:
          me.setState({searchResults: action.searchResults});
          me._setVisible(true);
          break;
        case GeocodingConstants.CLEAR_SEARCH_RESULT:
          me.setState({searchResults: null});
          me._setVisible(false);
          break;
        default:
          break;
      }
    });
    this.state = {
      searchResults: null,
      muiTheme: context.muiTheme || getMuiTheme()
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
      source: new ol.source.Vector({wrapX: false})
    });
    this.props.map.addLayer(this._layer);
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
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
    GeocodingActions.zoomToResult(result);
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: {
        background: rawTheme.palette.canvasColor,
        color: rawTheme.palette.textColor
      }
    };
  }
  render() {
    const styles = this.getStyles();
    const {formatMessage} = this.props.intl;
    var resultNodes;
    var subheader;
    if (this.state.searchResults !== null) {
      if (this.state.searchResults.length > 0) {
        resultNodes = this.state.searchResults.map(function(result) {
          var icon;
          if (result.icon) {
            icon = (<img src={result.icon}/>);
          }
          return (<ListItem leftIcon={icon} primaryText={result.display_name} key={result.place_id} onTouchTap={this._zoomTo.bind(this, result)} />
          );
        }, this);
      } else {
        subheader = formatMessage(messages.noresults);
      }
    }
    return (
      <div className={classNames('sdk-component geocoding-results', this.props.className)}>
        <div style={styles.root} className='geocoding-results-header'>{subheader}</div>
        <List className='geocoding-results-list'>
         {resultNodes}
        </List>
      </div>
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
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

GeocodingResults.defaultProps = {
  zoom: 10,
  markerUrl: './resources/marker.png'
};

GeocodingResults.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(GeocodingResults);
