/* global ol */
import React from 'react';
import LayerSelector from './LayerSelector.jsx';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import filtrex from 'filtrex';
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
    this.state = {
      hasError: false
    };
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
      this.setState({hasError: false});
    } else {
      try {
        this._queryFilter = filtrex(expression);
        this.setState({hasError: false});
      } catch (e) {
        this._queryFilter = null;
        this.setState({hasError: true});
      }
    }
  }
  _doQuery(selectIn) {
    var selection = [];
    this._setQueryFilter();
    if (this._queryFilter === null) {
      return;
    }
    var features = this._layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (this._queryFilter(properties)) {
        selection.push(features[i]);
      }
    }
    if (selectIn === true) {
      SelectActions.selectFeaturesInCurrentSelection(this._layer, selection, this);
    } else {
      SelectActions.selectFeatures(this._layer, selection, this);
    }
  }
  _addSelection() {
    this._doQuery();
  }
  _newSelection() {
    SelectActions.clear(this._layer, this);
    this._doQuery();
  }
  _inSelection() {
    this._doQuery(true);
  }
  render() {
    var inputClassName = 'form-control';
    if (this.state.hasError) {
      inputClassName += ' input-has-error';
    }
    return (
      <form className='form-horizontal query-builder'>
        <div className='input-group'>
          <span className='input-group-addon'>Layer</span>
          <LayerSelector ref='layerSelector' filter={this._filterLayerList} map={this.props.map} />
        </div>
        <div className='input-group'>
          <span className='input-group-addon'>Filter</span>
          <input onKeyUp={this._setQueryFilter.bind(this)} className={inputClassName} ref='queryExpression' id='query-expression' placeholder='Type expression ....' type='text'/>
        </div>
        <div className='form-group'>
          <div className='col-sm-12 controls'>
            <a onClick={this._newSelection.bind(this)} className='btn btn-primary' href='#' id='btn-query-new'>New selection</a>
            <a onClick={this._addSelection.bind(this)} className='btn btn-primary' href='#' id='btn-query-add'>Add to current selection</a>
            <a onClick={this._inSelection.bind(this)} className='btn btn-primary' href='#' id='btn-query-in'>Select in current selection</a>
          </div>
        </div>
      </form>
    );
  }
}

QueryBuilder.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
