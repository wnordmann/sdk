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
 import * as geocodingActions from '../actions/GeocodingActions';
 import classNames from 'classnames';
 import {defineMessages, injectIntl, intlShape} from 'react-intl';
 import TextField from 'material-ui/TextField';


 const messages = defineMessages({
   placeholder: {
     id: 'geocoding.placeholder',
     description: 'Placeholder string for the search placename geocoding input field',
     defaultMessage: 'Search placename...'
   }
 });

 export class Geocoding extends React.Component {
   static propTypes = {
     /**
      * The maximum number of results to return on a search.
      */
     maxResults: React.PropTypes.number,
     /**
      * Css class name to apply on the root element of this component.
      */
     className: React.PropTypes.string,
     /**
      * Style config.
      */
     style: React.PropTypes.object,
     /**
      * @ignore
      */
     intl: intlShape.isRequired,
     /**
      * @ignore
      */
     geocodingSearch: React.PropTypes.func
   }
   constructor(props) {
     super(props);
   }
   _searchAddress(event) {
     if (this.geocodeSearchText.input.value.length > 2) {
       this.props.geocodingSearch(this.geocodeSearchText.input.value, event.currentTarget);
     }
   }
   geocodeSearchText = '';

   render() {
     const {formatMessage} = this.props.intl;
     let geocodeSearchText;

     return (
       <TextField
         style={this.props.style}
         className={classNames('sdk-component geocoding', this.props.className)}
         ref={node => this.geocodeSearchText = node}
         value={geocodeSearchText}
         hintText={formatMessage(messages.placeholder)}
         onChange={this._searchAddress.bind(this)}
         />
     )
   }
 }
 // Maps state from store to props
 const mapStateToProps = (state, ownProps) => {
   return {
   }
 };

 // Maps actions to props
 const mapDispatchToProps = (dispatch) => {
   return {
   // You can now say this.props.createBook
     geocodingSearch: (search, target) => dispatch(geocodingActions.fetchGeocode(search, target))
   }
 };

 // Use connect to put them together
 export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Geocoding));
