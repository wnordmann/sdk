'use strict';

import React from 'react';
import LayerStore from '../stores/LayerStore.js';
import LayerListItem from './LayerListItem.jsx';

export default class LayerList extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
  }
  componentWillMount() {
    LayerStore.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  _onChange() {
    this.setState(LayerStore.getState());
  }
  render() {
    var layerNodes = this.state.layers.map(function(lyr) {
      return (
        /*jshint ignore:start */
        <LayerListItem key={lyr.get('title')} layer={lyr} title={lyr.get('title')} />
        /*jshint ignore:end */
      );
    });
    return (
      /*jshint ignore:start */
      <ul>
        {layerNodes}
      </ul>
      /*jshint ignore:end */
    );
  }
}
