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
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import classNames from 'classnames';
import debounce from  'debounce';
import FixedDataTable from 'fixed-data-table';
import './fixed-data-table.css';
import RaisedButton from './Button.jsx';
import ActionSearch from 'material-ui/lib/svg-icons/action/search';
import ClearIcon from 'material-ui/lib/svg-icons/content/clear';
import ArrowUp from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up';
import TextField from 'material-ui/lib/text-field';
import Checkbox from 'material-ui/lib/checkbox';
import FeatureStore from '../stores/FeatureStore.js';
import SelectActions from '../actions/SelectActions.js';
import LayerSelector from './LayerSelector.jsx';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import {SortHeaderCell, SortTypes} from './SortHeaderCell.jsx';
import {LinkCell} from './LinkCell.jsx';
import {TextCell} from './TextCell.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import FilterService from '../services/FilterService.js';
import FilterHelp from './FilterHelp.jsx';
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
    defaultMessage: 'Selected only'
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
 * <div ref='tablePanel' id='table-panel' className='feature-table'>
 *   <FeatureTable ref='table' resizeTo='table-panel' offset={[30, 30]} layer={selectedLayer} map={map} />
 * </div>
 * ```
 */
class FeatureTable extends React.Component {
  constructor(props, context) {
    super(props);
    this._onSortChange = this._onSortChange.bind(this);
    this._onChange = this._onChange.bind(this);
    FeatureStore.bindMap(this.props.map);
    this._selectedOnly = false;
    if (this.props.layer) {
      this._setLayer(this.props.layer);
    }
    this.state = {
      muiTheme: context.muiTheme || ThemeManager.getMuiTheme(),
      gridWidth: this.props.width,
      gridHeight: this.props.height,
      features: [],
      columnWidths: {},
      selected: [],
      colSortDirs: {},
      help: false
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
  _setLayer(layer) {
    this._layer = layer;
    if (layer !== null) {
      FeatureStore.addLayer(layer, this._selectedOnly);
    }
  }
  _onLayerSelectChange(layer) {
    // TODO add clearing filter back
    //ReactDOM.findDOMNode(this.refs.filter).value = '';
    this._setLayer(layer);
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
    if (this._layer) {
      var state = FeatureStore.getState(this._layer);
      if (!state) {
        delete this._layer;
        return;
      }
      this._defaultSortIndexes = [];
      var size = state.features.length;
      for (var index = 0; index < size; index++) {
        this._defaultSortIndexes.push(index);
      }
      var newState = {};
      newState.features = state.features.slice();
      newState.rowCount = newState.features.length;
      newState.originalFeatures = state.originalFeatures.slice();
      newState.selected = state.selected.slice();
      this.setState(newState);
      // re-sort
      if (this.state.sortIndexes && (this.state.sortIndexes.length !== state.features.length)) {
        var columnKey = Object.keys(this.state.colSortDirs)[0];
        this._onSortChange(columnKey, this.state.colSortDirs[columnKey]);
      }
    } else {
      this.setState({rowCount: 0, features: []});
    }
  }
  _onColumnResize(width, label) {
    var id = this._layer.get('id');
    var columnWidths = this.state.columnWidths;
    columnWidths[id] = columnWidths[id] || {};
    columnWidths[id][label] = Math.max(this.props.minColumnWidth, width);
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
      if (!this._filtered) {
        FeatureStore.restoreOriginalFeatures(lyr);
      } else {
        FeatureStore.setFilter(lyr, this._filteredRows);
      }
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
    sortIndexes.sort(function(a, b) {
      return a - b;
    });
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
  _filterByText(evt) {
    var filterBy = evt.target.value;
    var state = FeatureStore.getState(this._layer);
    var rows = this._selectedOnly ? state.selected : state.originalFeatures;
    var filteredRows = [];
    var queryFilter;
    try {
      queryFilter = FilterService.filter(filterBy);
    } catch (e) {
      queryFilter = null;
    }
    if (queryFilter !== null) {
      for (var i = 0, ii = rows.length; i < ii; ++i) {
        var row = rows[i];
        if (row) {
          var properties = rows[i].getProperties();
          if (queryFilter(properties)) {
            filteredRows.push(rows[i]);
          }
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
    this._filtered = (rows.length !== filteredRows.length);
    this._filteredRows = filteredRows;
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
  _getTextWidth(text, font) {
    let element = document.createElement('canvas');
    let context = element.getContext('2d');
    context.font = font;
    return context.measureText(text).width + 24;
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: {
        fontFamily: rawTheme.fontFamily,
        background: rawTheme.palette.canvasColor
      }
    };
  }
  render() {
    var {sortIndexes, colSortDirs} = this.state;
    const {formatMessage} = this.props.intl;
    var schema, id, row;
    if (this._layer) {
      schema = FeatureStore.getSchema(this._layer);
      id = this._layer.get('id');
      row = FeatureStore.getObjectAt(this._layer, 0);
    }
    var columnNodes = [];
    var defaultWidth;
    if (schema && this.state.gridWidth) {
      defaultWidth = Math.max(this.props.columnWidth, (this.state.gridWidth / Object.keys(schema).length));
    } else {
      defaultWidth = this.props.columnWidth;
    }
    if (!this.defaultColWidths) {
      this.defaultColWidths = {};
    }
    if (!this.defaultColWidths[id]) {
      this.defaultColWidths[id] = {};
    }
    for (var key in schema) {
      if (!this.defaultColWidths[id][key] && row) {
        this.defaultColWidths[id][key] = this._getTextWidth(row[key], '13px Helvetica Neue');
      }
      var width = this.state.columnWidths[id] && this.state.columnWidths[id][key] ? this.state.columnWidths[id][key] : this.defaultColWidths[id][key] ? this.defaultColWidths[id][key] : defaultWidth;
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
    const buttonStyle = this.props.buttonStyle;
    const styles = this.getStyles();
    var filterHelp = this._layer ? <FilterHelp textSearch={true} intl={this.props.intl} /> : undefined;
    return (
      <div style={styles.root} className={classNames('sdk-component feature-table', this.props.className)}>
        <div ref='form'>
          <div className='feature-table-options'>
            <div className='feature-table-selector'>
              <LayerSelector {...this.props} id='table-layerSelector' disabled={!this._layer} ref='layerSelector' onChange={this._onLayerSelectChange.bind(this)} filter={this._filterLayerList} map={this.props.map} value={id} />
            </div>
            <div className='feature-table-filter'>
              <TextField floatingLabelText={formatMessage(messages.filterlabel)} id='featuretable-filter' disabled={!this._layer} ref='filter' onChange={this._filterByText.bind(this)} hintText={formatMessage(messages.filterplaceholder)} />
              {filterHelp}
            </div>
            <Checkbox label={formatMessage(messages.onlyselected)} id='featuretable-onlyselected' disabled={!this._layer} checked={this._selectedOnly} onCheck={this._filter.bind(this)} disableTouchRipple={true}/>
          </div>
          <Toolbar className='feature-table-toolbar'>
            <RaisedButton disabled={!this._layer} style={buttonStyle} icon={<ActionSearch />} label={formatMessage(messages.zoombuttontext)} tooltip={formatMessage(messages.zoombuttontitle)} onTouchTap={this._zoomSelected.bind(this)} disableTouchRipple={true}/>
            <RaisedButton disabled={!this._layer} style={buttonStyle} icon={<ClearIcon />} label={formatMessage(messages.clearbuttontext)} tooltip={formatMessage(messages.clearbuttontitle)} onTouchTap={this._clearSelected.bind(this)} disableTouchRipple={true}/>
            <RaisedButton disabled={!this._layer} style={buttonStyle} icon={<ArrowUp />} label={formatMessage(messages.movebuttontext)} tooltip={formatMessage(messages.movebuttontitle)} onTouchTap={this._moveSelectedToTop.bind(this)} disableTouchRipple={true}/>
          </Toolbar>
        </div>
        <Table
          onColumnResizeEndCallback={this._onColumnResize.bind(this)}
          isColumnResizing={this._isResizing}
          rowHeight={this.props.rowHeight}
          rowClassNameGetter={this._rowClassNameGetter.bind(this)}
          headerHeight={this.props.headerHeight}
          onRowClick={this._onRowClick.bind(this)}
          rowsCount={this.state.rowCount}
          width={this.state.gridWidth}
          height={this.state.gridHeight}
          className='feature-table-table'>
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
   * The minimum width in pixels per column.
   */
  minColumnWidth: React.PropTypes.number,
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
   * Style for the buttons in the toolbar.
   */
  buttonStyle: React.PropTypes.object,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
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
  minColumnWidth: 10,
  pointZoom: 16,
  buttonStyle: {
    margin: '10px 12px'
  },
  offset: [0, 0],
  refreshRate: 250
};

FeatureTable.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(FeatureTable, {withRef: true}); // withRef needed so apps can call setDimensionsOnState
