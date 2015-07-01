/* global ol */
import React from 'react';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';

export default class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    this._store = new FeatureStore({layer: this.props.layer});
    this.state = {
      features: [],
      columnWidths: {}
    };
  }
  componentWillMount() {
    this._store.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  _onChange() {
    this.setState(this._store.getState());
  }
  _rowGetter(index) {
    var obj = this.state.features[index].getProperties();
    return Object.keys(obj).map(key => obj[key]);
  }
  _onColumnResize(width, idx) {
    var label = this.state.features[0].getKeys()[idx];
    var columnWidths = this.state.columnWidths;
    columnWidths[label] = width;
    this.setState({columnWidths: columnWidths});
  }
  render() {
    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    if (this.state.features.length > 0) {
      var me = this, idx = -1;
      var feature = this.state.features[0], geom = feature.getGeometryName();
      var columnNodes = feature.getKeys().map(function(key, idx) {
        if (key !== geom) {
          if (!me.state.columnWidths[key]) {
            me.state.columnWidths[key] = 100;
          }
          return (
            <Column
              isResizable={true}
              label={key}
              dataKey={idx}
              key={key}
              width={me.state.columnWidths[key]} />
          );
        }
      });
      return (
        <Table
          onColumnResizeEndCallback={this._onColumnResize.bind(this)}
          rowHeight={30}
          rowGetter={this._rowGetter.bind(this)}
          headerHeight={50}
          rowsCount={this.state.features.length}
          width={400}
          height={400}>
          {columnNodes}
        </Table>);
    } else {
      return false;
    }
  }
}

FeatureTable.propTypes = {
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired
};
