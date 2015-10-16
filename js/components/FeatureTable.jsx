import React from 'react';
import ol from 'openlayers';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import LayerSelector from './LayerSelector.jsx';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './FeatureTable.css';

const messages = defineMessages({
  layerlabel: {
    id: 'featuretable.layerlabel',
    description: 'Label for the layer select',
    defaultMessage: 'Layer'
  },
  zoombuttontitle: {
    id: 'featuretable.zoombuttontitle',
    description: 'Title for the zoom button',
    defaultMessage: 'Zoom to selected'
  },
  zoombuttontext: {
    id: 'featuretable.zoombuttontext',
    description: 'Text for the zoom button',
    defaultMessage: 'Zoom'
  },
  clearbuttontitle: {
    id: 'featuretable.clearbuttontitle',
    description: 'Title for the clear button',
    defaultMessage: 'Clear selected'
  },
  clearbuttontext: {
    id: 'featuretable.clearbuttontext',
    description: 'Text for the clear button',
    defaultMessage: 'Clear'
  },
  onlyselected: {
    id: 'featuretable.onlyselected',
    description: 'Label for the show selected features only checkbox',
    defaultMessage: 'Show only selected features'
  },
  filterplaceholder: {
    id: 'featuretable.filterplaceholder',
    description: 'Placeholder for filter expression input field',
    defaultMessage: 'Type filter expression'
  },
  filterlabel: {
    id: 'featuretable.filterlabel',
    description: 'Label for the filter expression input field',
    defaultMessage: 'Filter'
  }
});

/**
 * A table to show features. Allows for selection of features.
 */
class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    FeatureStore.bindMap(this.props.map);
    this._selectedOnly = false;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.SELECT_LAYER:
          if (action.cmp === this.refs.layerSelector) {
            React.findDOMNode(this.refs.filter).value = '';
            this._layer = action.layer;
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
      gridWidth: this.props.width,
      gridHeight: this.props.height,
      features: [],
      columnWidths: {},
      selected: []
    };
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange.bind(this));
    this._onChange();
  }
  componentDidMount() {
    this._setDimensionsOnState();
  }
  _setDimensionsOnState() {
    var tableWrapperNode = React.findDOMNode(this);
    this.setState({
      gridWidth: tableWrapperNode.offsetWidth,
      gridHeight: tableWrapperNode.offsetHeight
    });
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
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _filterByText(evt) {
    var filterBy = evt.target.value;
    var state = FeatureStore.getState(this._layer);
    var rows = state.originalFeatures.slice();
    var filteredRows = filterBy ? rows.filter(function(row) {
      var properties = row.getProperties();
      var geom = row.getGeometryName();
      for (var key in properties) {
        if (key !== geom) {
          var value = '' + properties[key];
          if (value.toLowerCase().indexOf(filterBy.toLowerCase()) >= 0) {
            return true;
          }
        }
      }
      return false;
    }) : rows;
    FeatureStore.setFilter(this._layer, filteredRows);
  }
  render() {
    const {formatMessage} = this.props.intl;
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
        <form onSubmit={this._onSubmit.bind(this)} role='form' className='form-inline'>
          <label>{formatMessage(messages.layerlabel)}:</label>
          <LayerSelector ref='layerSelector' filter={this._filterLayerList} map={this.props.map} value={this.props.layer.get('id')} />
          <UI.DefaultButton onClick={this._zoomSelected.bind(this)} title={formatMessage(messages.zoombuttontitle)}><Icon.Icon name="search" /> {formatMessage(messages.zoombuttontext)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._clearSelected.bind(this)} title={formatMessage(messages.clearbuttontitle)}><Icon.Icon name="trash" /> {formatMessage(messages.clearbuttontext)}</UI.DefaultButton>
          <div className='input-group'>
            <span className='input-group-addon'>{formatMessage(messages.filterlabel)}</span>
            <input type='text' ref='filter' className='form-control' onChange={this._filterByText.bind(this)} placeholder={formatMessage(messages.filterplaceholder)}></input>
          </div>
          <label><input type='checkbox' onChange={this._filter.bind(this)}></input> {formatMessage(messages.onlyselected)}</label>
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
          width={this.state.gridWidth}
          height={this.state.gridHeight}>
          {columnNodes}
        </Table>
      </div>);
  }
}

FeatureTable.propTypes = {
  /**
   * The ol3 map in which the source for the table resides.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The layer to use initially for loading the table.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired,
  /**
   * The width of the table component in pixels.
   */
  width: React.PropTypes.number,
  /**
   * The height of the table component in pixels.
   */
  height: React.PropTypes.number,
  /**
   * The height of a row in pixels.
   */
  rowHeight: React.PropTypes.number,
  /**
   * The height of the table header in pixels.
   */
  headerHeight: React.PropTypes.number,
  /**
   * The width in pixels per column.
   */
  columnWidth: React.PropTypes.number,
  /**
   * The zoom level to zoom the map to in case of a point geometry.
   */
  pointZoom: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

FeatureTable.defaultProps = {
  width: 400,
  height: 400,
  rowHeight: 30,
  headerHeight: 50,
  columnWidth: 100,
  pointZoom: 16
};

export default injectIntl(FeatureTable);
