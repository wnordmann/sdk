import React from 'react';
import ol from 'openlayers';

/**
 * A button to go back to the initial extent of the map.
 */
export default class HomeButton extends React.Component {
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
    return (
      <button title='Home' onClick={this._goHome.bind(this)}><i className='fa fa-home'></i></button>
    );
  }
}

HomeButton.propTypes = {
  /**
   * The ol3 map for whose view the initial center and zoom should be restored.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
