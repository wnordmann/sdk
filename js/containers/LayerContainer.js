import React from 'react';
import {connect} from 'react-redux';
import LayerListNew from '../components/LayerListNew.jsx';
import {addLayers, removeLayer} from '../actions/layers.js';

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
    if (map.getLayers().getArray().length > 0) {
      props.dispatch(addLayers(map.getLayers().getArray()));
    }
    map.getLayers().on('add', this._onAdd, this);
    map.getLayers().on('remove', this._onRemove, this);
  }
  _onAdd(evt) {
    this.props.dispatch(addLayers([evt.element]));
  }
  _onRemove(evt) {
    this.props.dispatch(removeLayer(evt.element));
  }
  render() {
    return (
      <LayerListNew layers={this.props.layers} />
    );
  }
}


LayerContainer = connect(
   mapStateToProps,
   mapDispatchToProps
)(LayerContainer);

export default LayerContainer;
