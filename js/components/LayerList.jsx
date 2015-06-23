'use strict';

import React from 'react';
import LayerStore from '../stores/LayerStore.js';
import LayerListItem from './LayerListItem.jsx';

export default class LayerList extends React.Component {
  constructor(props) {
    super(props);
    this.showZoomTo = props.showZoomTo !== undefined ? props.showZoomTo : false;
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
    return this.renderLayers(group.getLayers().getArray());
  }
  renderLayers(layers) {
    var me = this;
    var layerNodes = layers.map(function(lyr) {
      return me.getLayerNode(lyr);
    });
    return (
      <ul>
        {layerNodes}
      </ul>
    );
  }
  getLayerNode(lyr) {
    if (lyr instanceof ol.layer.Group) {
        var children = this.renderLayerGroup(lyr);
        return (
          <LayerListItem showZoomTo={this.showZoomTo} key={lyr.get('title')} layer={lyr} children={children} title={lyr.get('title')} />
        );
    } else {
      return (
        <LayerListItem showZoomTo={this.showZoomTo} key={lyr.get('title')} layer={lyr} title={lyr.get('title')} />
      );
    }
  }
  render() {
    var layers = this.state.layers.slice(0).reverse();
    return this.renderLayers(layers);
  }
}
