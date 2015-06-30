import React from 'react';
import LayerActions from '../actions/LayerActions.js';

export default class Geocoding extends React.Component {
  _searchBoxKeyPressed(e) {
    if (e.which === 13){
      this._searchAddress();
    }
  }
  _searchAddress() {
    var value = React.findDOMNode(this.refs.search).value;
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
      <div className='input-group'>
        <input type='text' onKeyPress={this._searchBoxKeyPressed.bind(this)} ref='search' id='geocoding-search' className='form-control' placeholder='Search placename...'/>
        <div className='input-group-btn'>
          <button className='btn btn-default' onClick={this._searchAddress.bind(this)}><span>&nbsp;</span><i className='glyphicon glyphicon-search'></i></button>
        </div>
      </div>
    );
  }
}

Geocoding.propTypes = {
  maxResults: React.PropTypes.number
};

Geocoding.defaultProps = {
  maxResults: 5
};
