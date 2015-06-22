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
    LayerActions.setVisible(this.props.layer, event.target.checked);
    this.setState({checked: event.target.checked});
  }
  _handleRemove(event) {
    LayerActions.removeLayer(this.props.layer);
  }
  render() {
    return (
      <li><input type="checkbox" checked={this.state.checked}
      onChange={this._handleChange.bind(this)}/>{this.props.title}
      <button onClick={this._handleRemove.bind(this)}/>
      {this.props.children}
      </li>
    );
  }
}
