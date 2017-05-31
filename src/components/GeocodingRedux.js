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

class geocodingRedux extends React.Component {
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
    console.log(event.currentTarget);
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
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(geocodingRedux));
