import React from 'react';
import GeocodingActions from '../actions/GeocodingActions.js';
import UI from 'pui-react-search-input';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
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
 */
@pureRender
class Geocoding extends React.Component {
  _searchBoxKeyPressed(e) {
    if (e.which === 13){
      this._searchAddress();
    }
  }
  _searchAddress(event) {
    var value = event.target.value;
    if (value !== '') {
      var cbname = 'fn' + Date.now();
      var script = document.createElement('script');
      script.src = 'http://nominatim.openstreetmap.org/search?format=json&limit=' + this.props.maxResults + '&q=' + value + '&json_callback=' + cbname;
      window[cbname] = function(jsonData) {
        GeocodingActions.showSearchResult(jsonData);
        delete window[cbname];
      };
      document.head.appendChild(script);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.SearchInput placeholder={formatMessage(messages.placeholder)} onChange={this._searchAddress.bind(this)}/>
    );
  }
}

Geocoding.propTypes = {
  /**
   * The maximum number of results to return on a search.
   */
  maxResults: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Geocoding.defaultProps = {
  maxResults: 5
};

export default injectIntl(Geocoding);
