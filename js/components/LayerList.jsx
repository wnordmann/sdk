'use strict';

import React from 'react';
import LayerStore from '../stores/LayerStore.js';
import LayerListItem from './LayerListItem.jsx';
import css from './LayerList.css';

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
  _showPanel() {
    this.setState({visible: true});
  }
  _hidePanel() {
    this.setState({visible: false});
  }
  getLayerNode(lyr) {
    if (lyr instanceof ol.layer.Group) {
        var children = this.props.showGroupContent ? this.renderLayerGroup(lyr) : undefined;
        return (
          <LayerListItem showOpacity={this.props.showOpacity} showDownload={this.props.showDownload} allowReordering={this.props.allowReordering} showZoomTo={this.props.showZoomTo} key={lyr.get('title')} layer={lyr} children={children} title={lyr.get('title')} />
        );
    } else {
      return (
        <LayerListItem showOpacity={this.props.showOpacity} showDownload={this.props.showDownload} allowReordering={this.props.allowReordering} showZoomTo={this.props.showZoomTo} key={lyr.get('title')} layer={lyr} title={lyr.get('title')} />
      );
    }
  }
  render() {
    var layers = this.state.layers.slice(0).reverse();
    var className = "ol-unselectable ol-control layer-switcher";
    if (this.state.visible) {
      className += ' shown';
    }
    return <div onMouseOut={this._hidePanel.bind(this)} onMouseOver={this._showPanel.bind(this)} className={className}><button onClick={this._showPanel.bind(this)} title="Layers"></button>
        <div className="layer-tree-panel">{this.renderLayers(layers)}</div></div>
  }
}

LayerList.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  showZoomTo: React.PropTypes.bool,
  allowReordering: React.PropTypes.bool,
  showGroupContent: React.PropTypes.bool,
  showDownload: React.PropTypes.bool,
  showOpacity: React.PropTypes.bool
};

LayerList.defaultProps = {
  showZoomTo: false,
  allowReordering: false,
  showGroupContent: false,
  showDownload: false,
  showOpacity: false
};
