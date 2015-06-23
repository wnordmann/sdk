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
  render() {
    var className = 'layer-check glyphicon';
    if (this.state.checked) {
      className += ' glyphicon-check';
    } else {
      className += ' glyphicon-unchecked';
    }
    return (
      <li>
        <span>
          <i onClick={this._handleChange.bind(this)} className={className}></i>
          {this.props.title}
        </span>
        {this.props.children}
      </li>
    );
  }
}
