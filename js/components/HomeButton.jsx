/* global ol */
import React from 'react';

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
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
