/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import debounce from  'debounce';
import FixedDataTable from 'fixed-data-table';
import './fixed-data-table.css';
import FeatureStore from '../stores/FeatureStore.js';
import LayerConstants from '../constants/LayerConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectActions from '../actions/SelectActions.js';
import LayerSelector from './LayerSelector.jsx';
import {SortHeaderCell, SortTypes} from './SortHeaderCell.jsx';
import {LinkCell} from './LinkCell.jsx';
import {TextCell} from './TextCell.jsx';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import filtrex from 'filtrex';
import pureRender from 'pure-render-decorator';
import './FeatureTable.css';

const {Table, Column} = FixedDataTable;

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
  movebuttontitle: {
    id: 'featuretable.movebuttontitle',
    description: 'Title for the move button',
    defaultMessage: 'Move selected to top'
  },
  movebuttontext: {
    id: 'featuretable.movebuttontext',
    description: 'Text for the move button',
    defaultMessage: 'Move'
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
  filterhelptext: {
    id: 'featuretable.filterhelptext',
    description: 'filter help text',
    defaultMessage: 'ATTRIBUTE == "Value"'
  },
  filterlabel: {
    id: 'featuretable.filterlabel',
    description: 'Label for the filter expression input field',
    defaultMessage: 'Filter'
  },
  filterbuttontext: {
    id: 'featuretable.filterbuttontext',
    description: 'Text for the filter button',
    defaultMessage: 'Filter results based on your criteria'
  }
});

/**
 * A table to show features. Allows for selection of features.
 *
 * ```javascript
 * var selectedLayer = map.getLayers().item(2);
 * ```
 *
 * ```xml
 * <div ref='tablePanel' id='table-panel' className='attributes-table'>
 *   <FeatureTable ref='table' resizeTo='table-panel' offset={[30, 30]} layer={selectedLayer} map={map} />
 * </div>
 * ```
 */
@pureRender
class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    this._onSortChange = this._onSortChange.bind(this);
    this._onChange = this._onChange.bind(this);
    FeatureStore.bindMap(this.props.map);
    this._selectedOnly = false;
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LayerConstants.SELECT_LAYER:
          if (action.cmp === me.refs.layerSelector) {
            ReactDOM.findDOMNode(me.refs.filter).value = '';
            me._layer = action.layer;
            FeatureStore.addLayer(action.layer, me._selectedOnly);
          }
          break;
        default:
          break;
      }
    });
    if (this.props.layer) {
      this._layer = this.props.layer;
      FeatureStore.addLayer(this._layer);
    }
    this.state = {
      gridWidth: this.props.width,
      gridHeight: this.props.height,
      features: [],
      columnWidths: {},
      selected: [],
      colSortDirs: {}
    };
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange);
    this._onChange();
    this.setDimensionsOnState = debounce(this.setDimensionsOnState, this.props.refreshRate);
  }
  componentDidMount() {
    this.setDimensionsOnState();
    this._attachResizeEvent();
  }
  componentWillUnmount() {
    FeatureStore.removeChangeListener(this._onChange);
    global.removeEventListener('resize', this.setDimensionsOnState);
  }
  _attachResizeEvent() {
    global.addEventListener('resize', this.setDimensionsOnState.bind(this), false);
  }
  setDimensionsOnState() {
    if (this.props.resizeTo) {
      var resizeToNode = document.getElementById(this.props.resizeTo);
      var formNode = ReactDOM.findDOMNode(this.refs.form);
      this.setState({
        gridWidth: resizeToNode.offsetWidth - this.props.offset[0],
        gridHeight: resizeToNode.offsetHeight - formNode.offsetHeight - this.props.offset[1]
      });
    }
  }
  _onChange() {
    if (!this._layer && this.refs.layerSelector) {
      this._layer = this.refs.layerSelector.getLayer();
    }
    if (this._layer) {
      var state = FeatureStore.getState(this._layer);
      this._defaultSortIndexes = [];
      var size = state.features.length;
      for (var index = 0; index < size; index++) {
        this._defaultSortIndexes.push(index);
      }
      var newState = {};
      newState.features = state.features.slice();
      newState.originalFeatures = state.originalFeatures.slice();
      newState.selected = state.selected.slice();
      this.setState(newState);
      // re-sort
      if (this.state.sortIndexes && (this.state.sortIndexes.length !== state.features.length)) {
        var columnKey = Object.keys(this.state.colSortDirs)[0];
        this._onSortChange(columnKey, this.state.colSortDirs[columnKey]);
      }
    }
  }
  _onColumnResize(width, label) {
    var id = this._layer.get('id');
    var columnWidths = this.state.columnWidths;
    columnWidths[id] = columnWidths[id] || {};
    columnWidths[id][label] = width;
    this.setState({columnWidths: columnWidths});
    this._isResizing = false;
  }
  _transformIndex(index) {
    return this.state.sortIndexes ? this.state.sortIndexes[index] : index;
  }
  _onRowClick(evt, index) {
    if (evt.target.tagName.toLowerCase() !== 'a') {
      var lyr = this._layer;
      var feature = this.state.features[this._transformIndex(index)];
      SelectActions.toggleFeature(lyr, feature);
    }
  }
  _rowClassNameGetter(index) {
    var feature = this.state.features[this._transformIndex(index)];
    return this.state.selected.indexOf(feature) > -1 ? 'row-selected' : '';
  }
  _filter(evt) {
    this._selectedOnly = evt.target.checked;
    this._updateStoreFilter();
  }
  _filterLayerList(lyr) {
    return lyr.get('title') !== null && (lyr instanceof ol.layer.Vector || lyr.get('wfsInfo') !== undefined);
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
  _moveSelectedToTop() {
    var selected = this.state.selected;
    var sortIndexes = [];
    for (var i = 0, ii = selected.length; i < ii; ++i) {
      var idx = this.state.features.indexOf(selected[i]);
      sortIndexes.push(idx);
    }
    var size = this.state.features.length;
    for (var index = 0; index < size; index++) {
      if (selected.indexOf(this.state.features[index]) === -1) {
        sortIndexes.push(index);
      }
    }
    this.setState({
      sortIndexes: sortIndexes
    });
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
      if (extent[0] === extent[2]) {
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
    var rows = state.originalFeatures;
    var filteredRows = [];
    var queryFilter;
    try {
      queryFilter = filtrex(filterBy);
    } catch (e) {
      queryFilter = null;
    }
    if (queryFilter !== null) {
      for (var i = 0, ii = rows.length; i < ii; ++i) {
        var properties = rows[i].getProperties();
        if (queryFilter(properties)) {
          filteredRows.push(rows[i]);
        }
      }
    }
    if (filteredRows.length === 0) {
      filteredRows = filterBy ? rows.filter(function(row) {
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
    }
    FeatureStore.setFilter(this._layer, filteredRows);
  }
  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      var valueA = FeatureStore.getFieldValue(this._layer, indexA, columnKey);
      var valueB = FeatureStore.getFieldValue(this._layer, indexB, columnKey);
      var sortVal = 0;
      if (valueA > valueB) {
        sortVal = 1;
      }
      if (valueA < valueB) {
        sortVal = -1;
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });
    this.setState({
      sortIndexes: sortIndexes,
      colSortDirs: {
        [columnKey]: sortDir
      }
    });
  }
  render() {
    var {sortIndexes, colSortDirs} = this.state;
    const {formatMessage} = this.props.intl;
    var schema, id;
    if (this._layer) {
      schema = FeatureStore.getSchema(this._layer);
      id = this._layer.get('id');
    }
    var columnNodes = [];
    var defaultWidth;
    if (schema && this.state.gridWidth) {
      defaultWidth = Math.max(this.props.columnWidth, (this.state.gridWidth / Object.keys(schema).length));
    } else {
      defaultWidth = this.props.columnWidth;
    }
    for (var key in schema) {
      var width = this.state.columnWidths[id] && this.state.columnWidths[id][key] ? this.state.columnWidths[id][key] : defaultWidth;
      columnNodes.push(
        <Column
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs[key]}>
              {key}
            </SortHeaderCell>
          }
          isResizable={true}
          cell={(schema[key] === 'link') ? <LinkCell sortIndexes={sortIndexes} layer={this._layer} col={key} /> : <TextCell sortIndexes={sortIndexes} layer={this._layer} col={key} />}
          key={key}
          columnKey={key}
          width={width} />
        );
    }
    return (
      <div id='attributes-table'>
        <form ref='form' onSubmit={this._onSubmit.bind(this)} role='form' className='form-inline'>
          <label htmlFor='table-layerSelector'>{formatMessage(messages.layerlabel)}:</label>
          <LayerSelector id='table-layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} value={id} />
          <UI.DefaultButton onClick={this._zoomSelected.bind(this)} title={formatMessage(messages.zoombuttontitle)}><Icon.Icon name="search" /> {formatMessage(messages.zoombuttontext)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._clearSelected.bind(this)} title={formatMessage(messages.clearbuttontitle)}><Icon.Icon name="trash" /> {formatMessage(messages.clearbuttontext)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._moveSelectedToTop.bind(this)} title={formatMessage(messages.movebuttontitle)}><Icon.Icon name="arrow-up" /> {formatMessage(messages.movebuttontext)}</UI.DefaultButton>
          <div className='input-group'>
            <span className='input-group-addon'><label htmlFor='featuretable-filter' title={formatMessage(messages.filterbuttontext)}>{formatMessage(messages.filterlabel)}</label></span>
            <input type='text' id='featuretable-filter' ref='filter' className='form-control'  onChange={this._filterByText.bind(this)} title={formatMessage(messages.filterhelptext)} placeholder={formatMessage(messages.filterplaceholder)}></input>
          </div>
          <label htmlFor='featuretable-onlyselected'><input id='featuretable-onlyselected' type='checkbox' checked={this._selectedOnly} onChange={this._filter.bind(this)}></input> {formatMessage(messages.onlyselected)}</label>
        </form>
        <Table
          onColumnResizeEndCallback={this._onColumnResize.bind(this)}
          isColumnResizing={this._isResizing}
          rowHeight={this.props.rowHeight}
          rowClassNameGetter={this._rowClassNameGetter.bind(this)}
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
  layer: React.PropTypes.instanceOf(ol.layer.Vector),
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
   * The id of the container to resize the feature table to.
   */
  resizeTo: React.PropTypes.string,
  /**
   * Array with offsetX and offsetY, the number of pixels to make the table smaller than the resizeTo container.
   */
  offset: React.PropTypes.array,
  /**
   * Refresh rate in ms that determines how often to resize the feature table when the window is resized.
   */
  refreshRate: React.PropTypes.number,
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
  pointZoom: 16,
  offset: [0, 0],
  refreshRate: 250
};

export default injectIntl(FeatureTable, {withRef: true}); // withRef needed so apps can call setDimensionsOnState
