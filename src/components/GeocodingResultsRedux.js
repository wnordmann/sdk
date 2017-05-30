import React from 'react';
import {connect} from 'react-redux';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';

const messages = defineMessages({
  noresults: {
    id: 'geocodingresults.noresults',
    description: 'Text to show when no results were found',
    defaultMessage: 'No results found'
  }
});

class geocodingResultsRedux extends React.Component {
  static propTypes = {
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  }
  constructor(props) {
    super(props);
  }
  _formatDisplayName(result) {
    const placeType = result.address[Object.keys(result.address)[0]];
    if (placeType) {
      const displayName = result.display_name.slice(placeType.length);
      return (<div className="locationDetails"><span className="place">{placeType}</span>{displayName}</div>)
    }

    return (<span>{result.display_name}</span>);
  }
  _zoomTo(result) {
    console.log('Got Nothing Yet');
  }
  handleRequestClose = () => {
    console.log('Got Nothing Yet');
  };
  render() {
    const {formatMessage} = this.props.intl;
    let resultNodes;
    if (this.props.results.length > 0) {
      resultNodes = this.props.results.map(function(result) {
        var icon;
        if (result.icon) {
          icon = (<div className="locationIcon"><i><img src={result.icon}/></i></div>);
        }else {
          icon = (<div className="locationIcon"><i className="fa fa-fw"></i></div>);
        }
        return (<div className="locationResult" key={result.place_id} onTouchTap={this._zoomTo.bind(this, result)}>
                  {icon}
                  {this._formatDisplayName(result)}
                </div>);
      }, this);
    } else {
      resultNodes = formatMessage(messages.noresults);
    }
    return (
      <Popover open={this.props.open}
        canAutoPosition={true}
        onRequestClose={this.handleRequestClose}>
        <Menu>
          <div className={classNames('sdk-component geocoding-results geocoding', this.props.className)}>
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
    open: state.geocoding.showGeocodingResults || false
  }
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
  // You can now say this.props.createBook
    // geocodingSearch: search => dispatch(geocodingActions.fetchGeocode(search))
  }
};

// Use connect to put them together
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(geocodingResultsRedux));
