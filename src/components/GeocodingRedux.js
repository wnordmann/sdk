import React from 'react';
import {connect} from 'react-redux';
import * as geocodingActions from '../actions/GeocodingActions';

class geocodingRedux extends React.Component {
  constructor(props) {
    super(props);
  }
  submitSearch(text) {
    this.props.geocodingSearch(text.search);
  }
  render() {
    let geocodeSearch;
    return (
      <div>
        <form onSubmit={e => {
          e.preventDefault();
          var input = {search: geocodeSearch.value};
          this.submitSearch(input);
          e.target.reset();
        }}>
          <input type='text' name='search' ref={node => geocodeSearch = node}/>
          <input type='submit'/>
        </form>
      </div>
    )
  }
}
// Maps state from store to props
const mapStateToProps = (state, ownProps) => {
  return {
    // results: state.geocoding.geocodingSearchResults || []
  }
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
  // You can now say this.props.createBook
    geocodingSearch: search => dispatch(geocodingActions.fetchGeocode(search))
  }
};

// Use connect to put them together
export default connect(mapStateToProps, mapDispatchToProps)(geocodingRedux);
