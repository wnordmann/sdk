import React from 'react';
import LayerSelector from './LayerSelector.jsx';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import Filtrex from 'filtrex';
import './QueryBuilder.css';

export default class QueryBuilder extends React.Component {
  constructor(props) {
    super(props);
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
       case MapConstants.SELECT_LAYER:
          if (action.cmp === this.refs.layerSelector) {
            this._layer = action.layer;
          }
          break;
        default:
          break;
      }
    });
  }
  componentDidMount() {
    this._layer = this.refs.layerSelector.getLayer();
  }
  _filterLayerList(lyr) {
    return lyr.get('isSelectable');
  }
  _setQueryFilter() {
    var input = React.findDOMNode(this.refs.queryExpression);
    var expression = input.value;
    if (!expression) {
      this._queryFilter = null;
    } else {
      try {
        this._queryFilter = Filtrex(expression);
      } catch (e) {
        this._queryFilter = null;
      }
    }
  }
  _newQuery() {
    var selection = [];
    this._setQueryFilter();
    var features = this._layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (this._queryFilter(properties)) {
        selection.push(features[i]);
      }
    }
    SelectActions.selectFeatures(this._layer, selection);
  }
  render() {
    return (
      <div className='query-panel'>
        <form className='form-horizontal'>
          <div className='input-group'>
            <span className='input-group-addon'>Layer</span>
            <LayerSelector ref='layerSelector' filter={this._filterLayerList} map={this.props.map} />
          </div>
          <div className='input-group'>
            <span className='input-group-addon'>Filter</span>
            <input className='form-control' ref='queryExpression' id='query-expression' placeholder='Type expression ....' type='text'/>
          </div>
          <div className='form-group'>
            <div className='col-sm-12 controls'>
              <a onClick={this._newQuery.bind(this)} className='btn btn-primary' href='#' id='btn-query-new'>New selection</a>
              <a className='btn btn-primary' href='#' id='btn-query-add'>Add to current selection</a>
              <a className='btn btn-primary' href='#' id='btn-query-in'>Select in current selection</a>
            </div>
          </div>
        </form>
      </div>
    );
  }
};

QueryBuilder.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
};
