import React from 'react';
import {connect} from 'react-redux';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

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
    intl: intlShape.isRequired,
    /**
     * @ignore
     */
    open: React.PropTypes.bool,
    /**
     * @ignore
     */
    results: React.PropTypes.array
  }
  static contextTypes = {
    muiTheme: React.PropTypes.object
  };
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };
  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
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
          icon = (<i className="locationIcon"><img src={result.icon}/></i>);
        }else {
          icon = (<i className="locationIcon" className="fa fa-fw"></i>);
        }
        return (<MenuItem className="locationResult" key={result.place_id} onTouchTap={this._zoomTo.bind(this, result)}>
                  {icon}{this._formatDisplayName(result)}
                </MenuItem>);
      }, this);
    } else {
      resultNodes = formatMessage(messages.noresults);
    }
    let anchorOrigin = {'horizontal':'left','vertical':'bottom'};
    let targetOrigin = {'horizontal':'left','vertical':'top'};
    return (
      <Popover open={this.props.open}
        anchorEl={this.props.target}
        anchorOrigin={anchorOrigin}
        targetOrigin={targetOrigin}
        canAutoPosition={true}
        onRequestClose={this.handleRequestClose}
        className={classNames('sdk-component geocoding-results geocoding', this.props.className)}>
        <Menu>
          {resultNodes}
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
  // You can now say this.props.createBook
    // geocodingSearch: search => dispatch(geocodingActions.fetchGeocode(search))
  }
};

// Use connect to put them together
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(geocodingResultsRedux));
