/* global ol */
import React from 'react';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import LayerSelector from './LayerSelector.jsx';
import UI from 'pui-react-buttons';
import Grids from 'pui-react-grids';
import Icon from 'pui-react-iconography';
import './FeatureTable.css';

export default class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    this._selectedOnly = false;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.SELECT_LAYER:
          this._layer = action.layer;
          if (action.cmp === this.refs.layerSelector) {
            FeatureStore.addLayer(action.layer, this._selectedOnly);
          }
          break;
        default:
          break;
      }
    });
    this._layer = this.props.layer;
    FeatureStore.addLayer(this._layer);
    this.state = {
      features: [],
      columnWidths: {},
      selected: []
    };
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  _renderLink(cellData) {
    return <a href={cellData} target="_blank">{cellData}</a>;
  }
  _onChange() {
    var state = FeatureStore.getState(this._layer);
    this.setState(state);
  }
  _rowGetter(index) {
    return FeatureStore.getObjectAt(this._layer, index);
  }
  _onColumnResize(width, label) {
    var id = this._layer.get('id');
    var columnWidths = this.state.columnWidths;
    columnWidths[id] = columnWidths[id] || {};
    columnWidths[id][label] = width;
    this.setState({columnWidths: columnWidths});
    this._isResizing = false;
  }
  _onRowClick(evt, index) {
    var lyr = this._layer;
    var feature = this.state.features[index];
    SelectActions.toggleFeature(lyr, feature);
  }
  _rowClassNameGetter(index) {
    var feature = this.state.features[index];
    return this.state.selected.indexOf(feature) > -1 ? 'row-selected' : '';
  }
  _filter(evt) {
    this._selectedOnly = evt.target.checked;
    this._updateStoreFilter();
  }
  _filterLayerList(lyr) {
    return !lyr.get('hideFromLayerList') && lyr instanceof ol.layer.Vector;
  }
  _updateStoreFilter() {
    var lyr = this._layer;
    if (this._selectedOnly === true) {
      FeatureStore.setSelectedAsFilter(lyr);
    } else {
      FeatureStore.restoreOriginalFeatures(lyr);
    }
  }
  _clearSelected() {
    if (this.state.selected.length > 0) {
      var lyr = this._layer;
      SelectActions.clear(lyr, this._selectedOnly);
    }
  }
  _zoomSelected() {
    var selected = this.state.selected;
    var len = selected.length;
    if (len > 0) {
      var extent = ol.extent.createEmpty();
      for (var i = 0; i < len; ++i) {
        extent = ol.extent.extend(extent, selected[i].getGeometry().getExtent());
      }
      var map = this.props.map;
      if (extent[0] === extent[2]){
        map.getView().setCenter([extent[0], extent[1]]);
        map.getView().setZoom(this.props.pointZoom);
      } else {
        map.getView().fit(extent, map.getSize());
      }
    }
  }
  render() {
    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    var schema = FeatureStore.getSchema(this._layer);
    var id = this._layer.get('id');
    var columnNodes = [];
    for (var key in schema) {
      var width = this.state.columnWidths[id] && this.state.columnWidths[id][key] ? this.state.columnWidths[id][key] : this.props.columnWidth;
      var cellRenderer = (schema[key] === 'link') ? this._renderLink : undefined;
      columnNodes.push(
        <Column
          isResizable={true}
          label={key}
          cellRenderer={cellRenderer}
          dataKey={key}
          key={key}
          width={width} />
        );
    }
    return (
      <div id='attributes-table'>
        <form role='form' className='form-inline'>
          <label>Layer:</label>
          <LayerSelector ref='layerSelector' filter={this._filterLayerList} map={this.props.map} value={this.props.layer.get('title')} />
          <UI.DefaultButton onClick={this._zoomSelected.bind(this)} title='Zoom to selected'><Icon.Icon name="search" /> Zoom</UI.DefaultButton>
          <UI.DefaultButton onClick={this._clearSelected.bind(this)} title='Clear selected'><Icon.Icon name="trash" /> Clear</UI.DefaultButton>
          <label><input type='checkbox' onChange={this._filter.bind(this)}></input> Show only selected features</label>
        </form>
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
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  rowHeight: React.PropTypes.number,
  headerHeight: React.PropTypes.number,
  columnWidth: React.PropTypes.number,
  pointZoom: React.PropTypes.number
};

FeatureTable.defaultProps = {
  width: 400,
  height: 400,
  rowHeight: 30,
  headerHeight: 50,
  columnWidth: 100,
  pointZoom: 16
};
