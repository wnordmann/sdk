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
  renderLayerGroup(group) {
    var layerNodes = group.getLayers().getArray().map(function(lyr) {
      return (
        <LayerListItem key={lyr.get('title')} layer={lyr} title={lyr.get('title')} />
      );
    });
    return (
      <ul>
        {layerNodes}
      </ul>
    );
  }
  render() {
    var me = this;
    var layerNodes = this.state.layers.map(function(lyr) {
      if (lyr instanceof ol.layer.Group) {
        var children = me.renderLayerGroup(lyr);
        return (
          <LayerListItem key={lyr.get('title')} layer={lyr} children={children} title={lyr.get('title')} />
        );
      } else {
        return (
          <LayerListItem key={lyr.get('title')} layer={lyr} title={lyr.get('title')} />
        );
      }
    });
    return (
      <ul>
        {layerNodes}
      </ul>
    );
  }
}
