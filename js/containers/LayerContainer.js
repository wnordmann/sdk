import React from 'react';
import {connect} from 'react-redux';
import LayerList from '../components/LayerList.jsx';
import {addLayer, removeLayer} from '../actions/layers.js';

const mapStateToProps = (state) => {
  return {
    layers: state.layers
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  };
};

class LayerContainer extends React.Component {
  constructor(props) {
    super(props);
    var map = props.map;
    var layers = map.getLayers().getArray();
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      props.dispatch(addLayer(layers[i]), i);
    }
    map.getLayers().on('add', this._onAdd, this);
    map.getLayers().on('remove', this._onRemove, this);
  }
  _onAdd(evt) {
    // TODO handle nested groups
    var idx = this.props.map.getLayers().getArray().indexOf(evt.element);
    this.props.dispatch(addLayer(evt.element, idx));
  }
  _onRemove(evt) {
    this.props.dispatch(removeLayer(evt.element));
  }
  _removeLayer(layer) {
    this.props.map.getLayers().remove(layer);
  }
  _moveUp(layer, group) {
    var layers;
    if (group) {
      layers = group.getLayers();
    } else {
      layers = this.props.map.getLayers();
    }
    var layerArray = layers.getArray();
    var index = layerArray.indexOf(layer);
    var topMost = true;
    for (var i = layerArray.length - 1; i > index; i--) {
      if (layerArray[i].get('title') !== null) {
        topMost = false;
        break;
      }
    }
    if (!topMost) {
      var next = layers.item(index + 1);
      layers.removeAt(index);
      layers.insertAt(index + 1, layer);
      layers.setAt(index, next);
    }
  }
  _moveDown(layer, group) {
    var layers;
    if (group) {
      layers = group.getLayers();
    } else {
      layers = this.props.map.getLayers();
    }
    var layerArray = layers.getArray();
    var index = layerArray.indexOf(layer);
    var bottomMost = true;
    for (var i = index - 1; i >= 0 ; i--) {
      if (layerArray[i].get('title') !== null && layerArray[i].get('type') !== 'base-group') {
        bottomMost = false;
        break;
      }
    }
    if (!bottomMost) {
      var prev = layers.item(index - 1);
      layers.removeAt(index);
      layers.insertAt(index - 1, layer);
      layers.setAt(index, prev);
    }
  }
  render() {
    return (
      <LayerList onMoveUp={this._moveUp.bind(this)} onMoveDown={this._moveDown.bind(this)} onRemove={this._removeLayer.bind(this)} {...this.props} />
    );
  }
}


LayerContainer = connect(
   mapStateToProps,
   mapDispatchToProps
)(LayerContainer);

export default LayerContainer;
