'use strict';

import React from 'react';
import LayerActions from '../actions/LayerActions.js';

export default class LayerListItem extends React.Component {
  constructor(props) {
    super(props);
    props.layer.on('change:visible', function(evt) {
      this.setState({checked: evt.target.getVisible()});
    }, this);
    this.state = {checked: props.layer.getVisible()};
  }
  _handleChange(event) {
    var visible = !this.props.layer.getVisible();
    LayerActions.setVisible(this.props.layer, visible);
    this.setState({checked: visible});
  }
  _zoomTo() {
    LayerActions.zoomToLayer(this.props.layer);
  }
  render() {
    var className = 'layer-check glyphicon';
    if (this.state.checked) {
      className += ' glyphicon-check';
    } else {
      className += ' glyphicon-unchecked';
    }
    var zoomTo;
    if (this.props.layer.get("type") !== "base" && this.props.showZoomTo) {
      zoomTo = <a title='Zoom to layer' href='#' onClick={this._zoomTo.bind(this)}><i className='layer-zoom-to glyphicon glyphicon-zoom-in'></i></a>
    }
    return (
      <li>
        <span>
          <i onClick={this._handleChange.bind(this)} className={className}></i>
          {this.props.title}
        </span>
        {zoomTo}
        {this.props.children}
      </li>
    );
  }
}
