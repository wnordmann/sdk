import React from 'react';
import {connect} from 'react-redux';
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

class MapController extends React.Component {
  constructor(props) {
    super(props);
    var map = props.map;
    var layers = map.getLayers().getArray();
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      props.dispatch(addLayer(map, layers[i]), i);
    }
    map.getLayers().on('add', this._onAdd, this);
    map.getLayers().on('remove', this._onRemove, this);
  }
  _onAdd(evt) {
    // TODO handle nested groups
    var idx = this.props.map.getLayers().getArray().indexOf(evt.element);
    this.props.dispatch(addLayer(this.props.map, evt.element, idx));
  }
  _onRemove(evt) {
    this.props.dispatch(removeLayer(this.props.map, evt.element));
  }
  render() {
    return (<div/>);
  }
}


MapController = connect(
   mapStateToProps,
   mapDispatchToProps
)(MapController);

export default MapController;
