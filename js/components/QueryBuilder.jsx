import React from 'react';
import ol from 'openlayers';
import LayerSelector from './LayerSelector.jsx';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import filtrex from 'filtrex';
import UI from 'pui-react-buttons';
import Grids from 'pui-react-grids';
import Icon from 'pui-react-iconography';
import './QueryBuilder.css';

/**
 * A component that allows users to perform queries on vector layers. Queries can be new queries, added to existing queries or users can filter inside of an existing query a.k.a. drill-down.
 */
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
      SelectActions.selectFeaturesInCurrentSelection(this._layer, selection);
    } else {
      SelectActions.selectFeatures(this._layer, selection);
    }
  }
  _addSelection() {
    this._doQuery();
  }
  _newSelection() {
    SelectActions.clear(this._layer);
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
      <form role="form" className='form-horizontal query-builder'>
        <div className="form-group">
          <Grids.Col md={3}><label>Layer</label></Grids.Col>
          <Grids.Col md={21}><LayerSelector ref='layerSelector' filter={this._filterLayerList} map={this.props.map} /></Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={3}><label>Filter</label></Grids.Col>
          <Grids.Col md={21}><input onKeyUp={this._setQueryFilter.bind(this)} className={inputClassName} ref='queryExpression' id='query-expression' placeholder='Type expression ....' type='text'/></Grids.Col>
        </div>
        <div className='form-group text-center'>
            <UI.DefaultButton onClick={this._newSelection.bind(this)} title="New selection"><Icon.Icon name="file" /> New</UI.DefaultButton>
            <UI.DefaultButton onClick={this._addSelection.bind(this)} title="Add to current selection"><Icon.Icon name="plus" /> Add</UI.DefaultButton>
            <UI.DefaultButton onClick={this._inSelection.bind(this)} title="Select in current selection"><Icon.Icon name="filter" /> Select</UI.DefaultButton>
        </div>
      </form>
    );
  }
}

QueryBuilder.propTypes = {
  /**
   * The ol3 map whose layers can be used for the querybuilder.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
