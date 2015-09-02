import React from 'react';
import LayerActions from '../actions/LayerActions.js';
import UI from 'pui-react-search-input';
import '../../node_modules/pui-css-forms/forms.css';

export default class Geocoding extends React.Component {
  _searchBoxKeyPressed(e) {
    if (e.which === 13){
      this._searchAddress();
    }
  }
  _searchAddress(evt) {
    var value = event.target.value
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
    return (
      <UI.SearchInput placeholder='Search placename...' onChange={this._searchAddress.bind(this)}/>
    );
  }
}

Geocoding.propTypes = {
  maxResults: React.PropTypes.number
};

Geocoding.defaultProps = {
  maxResults: 5
};
