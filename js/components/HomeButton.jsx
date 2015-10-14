import React from 'react';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  buttontitle: {
    id: 'homebutton.buttontitle',
    description: 'Title for the home button',
    defaultMessage: 'Home'
  }
});

/**
 * A button to go back to the initial extent of the map.
 */
class HomeButton extends React.Component {
  constructor(props) {
    super(props);
    var view = this.props.map.getView();
    this._center = view.getCenter();
    this._resolution = view.getResolution();
    if (this._center === null) {
      view.once('change:center', function(evt) {
        this._center = evt.target.getCenter();
      }, this);
    }
    if (this._resolution === undefined) {
      view.once('change:resolution', function(evt) {
        this._resolution = evt.target.getResolution();
      }, this);
    }
  }
  _goHome() {
    if (this._center !== null && this._resolution !== undefined) {
      var view = this.props.map.getView();
      view.setCenter(this._center);
      view.setResolution(this._resolution);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <button title={formatMessage(messages.buttontitle)} onClick={this._goHome.bind(this)}><i className='fa fa-home'></i></button>
    );
  }
}

HomeButton.propTypes = {
  /**
   * The ol3 map for whose view the initial center and zoom should be restored.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(HomeButton);
