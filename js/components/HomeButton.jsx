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
    this._zoom = view.getZoom();
  }
  _goHome() {
    var view = this.props.map.getView();
    view.setCenter(this._center);
    view.setZoom(this._zoom);
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
