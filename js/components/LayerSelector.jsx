/* global ol */
import React from 'react';
import LayerStore from '../stores/LayerStore.js';
import LayerActions from '../actions/LayerActions.js';

export default class LayerSelector extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
  }
  componentWillMount() {
    LayerStore.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  getLayer() {
    var select = React.findDOMNode(this.refs.layerSelect);
    return LayerStore.findLayer(select.value);
  }
  componentDidMount() {
    var select = React.findDOMNode(this.refs.layerSelect);
    var layer = LayerStore.findLayer(select.value);
    LayerActions.selectLayer(layer, this);
  }
  _onChange() {
    this.setState(LayerStore.getState());
  }
  _onItemChange(evt) {
    var layer = LayerStore.findLayer(evt.target.value);
    LayerActions.selectLayer(layer, this);
  }
  render() {
    var me = this;
    var selectItems = this.state.layers.map(function(lyr, idx) {
      var title = lyr.get('title');
      if (!me.props.filter || me.props.filter(lyr) === true) {
        return (
          <option value={title} key={idx}>{title}</option>
        );
      }
    });
    return (
      <select ref='layerSelect' defaultValue={this.props.value} className='form-control' onChange={this._onItemChange.bind(this)}>
        {selectItems}
      </select>
    );
  }
}

LayerSelector.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  filter: React.PropTypes.func,
  value: React.PropTypes.string
};
