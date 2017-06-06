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
 import {connect} from 'react-redux';
 import Popover from 'material-ui/Popover';
 import Menu from 'material-ui/Menu';
 import ol from 'openlayers';
 import {defineMessages, injectIntl, intlShape} from 'react-intl';
 import classNames from 'classnames';
 import getMuiTheme from 'material-ui/styles/getMuiTheme';
 import * as geocodingActions from '../actions/GeocodingActions';
 import './Geocoding.css';

 const messages = defineMessages({
   noresults: {
     id: 'geocodingresults.noresults',
     description: 'Text to show when no results were found',
     defaultMessage: 'No results found'
   }
 });

 export class GeocodingResults extends React.PureComponent {
   static propTypes = {
     /**
      * Css class name to apply on the root element of this component.
      */
     className: React.PropTypes.string,
     /**
      * @ignore
      */
     intl: intlShape.isRequired,
     /**
      * @ignore
      */
     open: React.PropTypes.bool,
     /**
      * @ignore
      */
     results: React.PropTypes.array,
     /**
     * The zoom level used when centering the view on a geocoding result.
     */
     zoom: React.PropTypes.number,
     /**
     * Url to the marker image to use for bookmark position.
     */
     markerUrl: React.PropTypes.string,
     /**
     * The map to use for this map panel, only needed if map context is not provided by MapPanel.
     */
     map: React.PropTypes.instanceOf(ol.Map)
    //  /**
    //   * @ignore
    //   */
    //  geocodingSelect: React.PropTypes.func,
    //  /**
    //   * @ignore
    //   */
    //  geocodingClose: React.PropTypes.func
   }
   static contextTypes = {
     map: React.PropTypes.instanceOf(ol.Map),
     muiTheme: React.PropTypes.object
   };
   static childContextTypes = {
     muiTheme: React.PropTypes.object.isRequired
   };
   static defaultProps = {
     zoom: 10,
     markerUrl: './resources/marker.png'
   };
   constructor(props, context) {
     super(props);
     this._muiTheme = context.muiTheme || getMuiTheme();
     this.map = context.map || this.props.map;
   }
   getChildContext() {
     return {muiTheme: this._muiTheme};
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
    this.map.addLayer(this._layer);
  }

   _formatDisplayName(result) {
     const placeType = result.address[Object.keys(result.address)[0]];
     if (placeType) {
       const displayName = result.display_name.slice(placeType.length);
       return (<span className="locationDetails"><span className="place">{placeType}</span>{displayName}</span>)
     }

     return (<span>{result.display_name}</span>);
   }
  _zoomTo(result) {
    var map = this.map;
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
    this.props.geocodingSelect();
  }
    _handleRequestClose = () => {
      this.props.geocodingClose();
    };
   render() {
     const {formatMessage} = this.props.intl;
     let resultNodes;
     if (this.props.results) {
       resultNodes = this.props.results.map(function(result) {
         var icon;
         if (result.icon) {
           icon = (<div className="locationIcon"><i><img src={result.icon}/></i></div>);
         }else {
           icon = (<div className="locationIcon"><i className="fa fa-fw"></i></div>);
         }
         return (<div className="locationResult" key={result.place_id} onTouchTap={this._zoomTo.bind(this, result)}>
                   {icon}{this._formatDisplayName(result)}
                 </div>);
       }, this);
     } else {
       resultNodes = formatMessage(messages.noresults);
     }
     let anchorOrigin = {'horizontal':'right','vertical':'bottom'};
     let targetOrigin = {'horizontal':'right','vertical':'top'};
     return (
       <Popover open={this.props.open}
         anchorEl={this.props.target}
         anchorOrigin={anchorOrigin}
         targetOrigin={targetOrigin}
         canAutoPosition={false}
         useLayerForClickAway={false}
         onRequestClose={this._handleRequestClose}
         className={classNames('sdk-component geocoding-results geocoding', this.props.className)}>
         <Menu>
           <div className='geoCodingResults'>
             {resultNodes}
           </div>
         </Menu>
       </Popover>
     );
   }
 }
 // Maps state from store to props
 const mapStateToProps = (state, ownProps) => {
   return {
     results: state.geocoding.geocodingSearchResults || [],
     target: state.geocoding.geocodingTarget,
     open: state.geocoding.showGeocodingResults || false
   }
 };

 // Maps actions to props
 const mapDispatchToProps = (dispatch) => {
   return {
     geocodingClose: search => dispatch(geocodingActions.geocodingClose()),
     geocodingSelect: () => dispatch(geocodingActions.geocodingSelect())
   }
 };

 // Use connect to put them together
 export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(GeocodingResults));
