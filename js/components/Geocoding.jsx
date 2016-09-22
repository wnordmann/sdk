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
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import GeocodingConstants from '../constants/GeocodingConstants.js';
import GeocodingActions from '../actions/GeocodingActions.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import TextField from 'material-ui/TextField';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  placeholder: {
    id: 'geocoding.placeholder',
    description: 'Placeholder string for the search placename geocoding input field',
    defaultMessage: 'Search placename...'
  }
});

/**
 * Input field to search for placenames using a geocoding service (OSM nominatim).
 *
 * ```xml
 * <div id='geocoding' className='pull-right'><Geocoding /></div>
 * ```
 */
@pureRender
class Geocoding extends React.Component {
  constructor(props) {
    super(props);
    var me = this;
    this.state = {
      value: null
    };
    this._dispatchToken = AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case GeocodingConstants.ZOOM_TO_RESULT:
          me.setState({value: ''});
          break;
        default:
          break;
      }
    });
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  _searchAddress(event) {
    var value = this.refs.query.getValue();
    this.setState({value: value});
    if (value !== '') {
      var cbname = 'fn' + Date.now();
      var script = document.createElement('script');
      script.src = 'http://nominatim.openstreetmap.org/search?format=json&limit=' + this.props.maxResults + '&q=' + value + '&json_callback=' + cbname;
      global[cbname] = function(jsonData) {
        GeocodingActions.showSearchResult(jsonData);
        delete global[cbname];
      };
      document.head.appendChild(script);
    } else {
      GeocodingActions.clearSearchResult();
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <TextField {...this.props} className={classNames('sdk-component geocoding', this.props.className)} ref='query' value={this.state.value} hintText={formatMessage(messages.placeholder)} onChange={this._searchAddress.bind(this)}/>
    );
  }
}

Geocoding.propTypes = {
  /**
   * The maximum number of results to return on a search.
   */
  maxResults: React.PropTypes.number,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Geocoding.defaultProps = {
  maxResults: 5
};

export default injectIntl(Geocoding);
