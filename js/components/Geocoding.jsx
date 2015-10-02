import React from 'react';
import LayerActions from '../actions/LayerActions.js';
import UI from 'pui-react-search-input';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

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
class Geocoding extends React.Component {
  _searchBoxKeyPressed(e) {
    if (e.which === 13){
      this._searchAddress();
    }
  }
  _searchAddress() {
    var value = event.target.value;
    if (value !== '') {
      var cbname = 'fn' + Date.now();
      var script = document.createElement('script');
      script.src = 'http://nominatim.openstreetmap.org/search?format=json&limit=' + this.props.maxResults + '&q=' + value + '&json_callback=' + cbname;
      window[cbname] = function(jsonData) {
        LayerActions.showSearchResult(jsonData);
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
  intl: intlShape.isRequired
};

Geocoding.defaultProps = {
  maxResults: 5
};

export default injectIntl(Geocoding);
