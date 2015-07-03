/* global ol */
import React from 'react';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import './FeatureTable.css';

export default class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.SELECT_LAYER:
          this._store.bindLayer(action.layer);
          break;
        default:
          break;
      }
    });
    this._store = new FeatureStore({layer: this.props.layer});
    this.state = {
      features: [],
      columnWidths: {},
      selected: {}
    };
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
    state.selected = {};
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
    this.state.selected[index] = !this.state.selected[index];
    this.setState({selected: this.state.selected});
  }
  _rowClassNameGetter(index) {
    return this.state.selected[index] ? 'row-selected' : '';
  }
  render() {
    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    if (this.state.features.length > 0) {
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
        </Table>);
    } else {
      return false;
    }
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
