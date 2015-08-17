/* global ol */
import React from 'react';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';
import MapConstants from '../constants/MapConstants.js';
import SelectConstants from '../constants/SelectConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import './FeatureTable.css';

export default class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    AppDispatcher.register((payload) => {
      let action = payload.action, id;
      switch(action.type) {
       case MapConstants.SELECT_LAYER:
          id = action.layer.get('id');
          if (!this.state.selected[id]) {
            this.state.selected[id] = [];
          }
          if (this.state.selectedOnly === true) {
            this._store.bindLayer(action.layer, this.state.selected[id]);
          } else {
            this._store.bindLayer(action.layer);
          }
          break;
        case SelectConstants.SELECT_FEATURES:
          var layer = action.layer;
          id = layer.get('id');
          this.state.selected[id] = [];
          for (var i = 0, ii = action.features.length; i < ii; ++i) {
            this.state.selected[id].push(action.features[i]);
          }
          if (this.state.selectedOnly === true) {
            if (this._store.getLayer() === layer) {
              this._store.setFilter(this.state.selected[id]);
            }
          } else {
            this.setState({selected: this.state.selected});
          }
          break;
        default:
          break;
      }
    });
    this._store = new FeatureStore({layer: this.props.layer});
    this.state = {
      selectedOnly: false,
      features: [],
      columnWidths: {},
      selected: {}
    };
    this.state.selected[this.props.layer.get('id')] = [];
  }
  componentWillMount() {
    this._store.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  _renderLink(cellData) {
    return <a href={cellData} target="_blank">{cellData}</a>;
  }
  _onChange() {
    var state = this._store.getState();
    state.columnWidths = {};
    this.setState(state);
  }
  _rowGetter(index) {
    return this._store.getObjectAt(index);
  }
  _onColumnResize(width, label) {
    var columnWidths = this.state.columnWidths;
    columnWidths[label] = width;
    this.setState({columnWidths: columnWidths});
    this._isResizing = false;
  }
  _onRowClick(evt, index) {
    var lyr = this._store.getLayer(), id = lyr.get('id');
    var feature = this.state.features[index];
    var idx = this.state.selected[id].indexOf(feature);
    if (idx > -1) {
      this.state.selected[id].splice(idx, 1);
      SelectActions.unselectFeature(lyr, feature);
    } else {
      this.state.selected[id].push(feature);
      SelectActions.selectFeature(lyr, feature);
    }
    this.setState({selected: this.state.selected});

  }
  _rowClassNameGetter(index) {
    var lyr = this._store.getLayer(), id = lyr.get('id');
    var feature = this.state.features[index];
    return this.state.selected[id].indexOf(feature) > -1 ? 'row-selected' : '';
  }
  _filter(evt) {
    var lyr = this._store.getLayer(), id = lyr.get('id');
    // store->setFilter will trigger setState so no need for an explicit setState call here
    this.state.selectedOnly = evt.target.checked;
    if (this.state.selectedOnly === true) {
      this._store.setFilter(this.state.selected[id]);
    } else {
      this._store.setFilter(null);
    }
  }
  render() {
    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    var schema = this._store.getSchema();
    var columnNodes = [];
    for (var key in schema) {
      if (!this.state.columnWidths[key]) {
        this.state.columnWidths[key] = this.props.columnWidth;
      }
      var cellRenderer = (schema[key] === 'link') ? this._renderLink : undefined;
      columnNodes.push(
        <Column
          isResizable={true}
          label={key}
          cellRenderer={cellRenderer}
          dataKey={key}
          key={key}
          width={this.state.columnWidths[key]} />
        );
    }
    return (
      <div>
        <label><input type='checkbox' onChange={this._filter.bind(this)}></input>Show only selected features</label>
        <Table
          onColumnResizeEndCallback={this._onColumnResize.bind(this)}
          isColumnResizing={this._isResizing}
          rowHeight={this.props.rowHeight}
          rowClassNameGetter={this._rowClassNameGetter.bind(this)}
          rowGetter={this._rowGetter.bind(this)}
          headerHeight={this.props.headerHeight}
          onRowClick={this._onRowClick.bind(this)}
          rowsCount={this.state.features.length}
          width={this.props.width}
          height={this.props.height}>
          {columnNodes}
        </Table>
      </div>);
  }
}

FeatureTable.propTypes = {
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  rowHeight: React.PropTypes.number,
  headerHeight: React.PropTypes.number,
  columnWidth: React.PropTypes.number
};

FeatureTable.defaultProps = {
  width: 400,
  height: 400,
  rowHeight: 30,
  headerHeight: 50,
  columnWidth: 100
};
