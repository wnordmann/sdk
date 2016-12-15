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
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import classNames from 'classnames';
import debounce from  'debounce';
import ReactTable from 'react-table'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import RaisedButton from './Button';
import ActionSearch from 'material-ui/svg-icons/action/search';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FeatureStore from '../stores/FeatureStore';
import SelectActions from '../actions/SelectActions';
import LayerSelector from './LayerSelector';
import {Toolbar} from 'material-ui/Toolbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Snackbar from 'material-ui/Snackbar';
import FilterService from '../services/FilterService';
import FilterHelp from './FilterHelp';
import './react-table.css';
import './FeatureTable.css';

const messages = defineMessages({
  optionslabel: {
    id: 'featuretable.optionslabel',
    description: 'Label for the collapsble options',
    defaultMessage: 'Options'
  },
  nodatamsg: {
    id: 'featuretable.nodatamsg',
    description: 'Message to display if there are no layers with data',
    defaultMessage: 'You haven\’t loaded any layers with feature data yet, so there is no data to display in the table. When you add a layer with feature data, that data will show here.'
  },
  errormsg: {
    id: 'featuretable.errormsg',
    description: 'Error message to show when filtering fails',
    defaultMessage: 'There was an error filtering your features. ({msg})'
  },
  loaderrormsg: {
    id: 'featuretable.loaderrormsg',
    description: 'Error message to show when loading fails',
    defaultMessage: 'There was an error loading your features. ({msg})'
  },
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
 * <FeatureTable ref='table' layer={selectedLayer} map={map} />
 * ```
 *
 * ![Feature Table](../FeatureTable.png)
 */
class FeatureTable extends React.Component {
  static propTypes = {
    /**
     * The ol3 map in which the source for the table resides.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * The layer to use initially for loading the table.
     */
    layer: React.PropTypes.instanceOf(ol.layer.Layer),
    /**
     * The zoom level to zoom the map to in case of a point geometry.
     */
    pointZoom: React.PropTypes.number,
    /**
     * Refresh rate in ms that determines how often to resize the feature table when the window is resized.
     */
    refreshRate: React.PropTypes.number,
    /**
     * Number of features per page.
     */
    pageSize: React.PropTypes.number,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired,
    /**
     * Optional fixed height in pixels.
     */
    height: React.PropTypes.number,
    /**
     * Should we allow for sorting the data?
     */
    sortable: React.PropTypes.bool,
    /**
     * Callback that gets called when the height needs updating of the parent container.
     */
    onUpdate: React.PropTypes.func
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    pageSize: 20,
    pointZoom: 16,
    sortable: true,
    refreshRate: 250
  };

  constructor(props, context) {
    super(props);
    this._onChange = this._onChange.bind(this);
    FeatureStore.bindMap(this.props.map);
    this._selectedOnly = false;
    this._pagesLoaded = {};
    this.state = {
      expanded: !this.props.height,
      pageSize: props.pageSize,
      pages: -1,
      active: false,
      errorOpen: false,
      error: false,
      muiTheme: context.muiTheme || getMuiTheme(),
      features: null,
      selected: null,
      help: false
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange);
    this._onChange();
    this.setDimensionsOnState = debounce(this.setDimensionsOnState, this.props.refreshRate).bind(this);
  }
  componentDidMount() {
    this._element = ReactDOM.findDOMNode(this).parentNode;
    this._formNode = ReactDOM.findDOMNode(this.refs.form);
    this._attachResizeEvent();
    if (this.props.layer) {
      this._setLayer(this.props.layer);
      if (this.props.onUpdate) {
        this.props.onUpdate();
      }
    }
  }
  componentWillUnmount() {
    FeatureStore.removeChangeListener(this._onChange);
    global.removeEventListener('resize', this.setDimensionsOnState);
  }
  _attachResizeEvent() {
    global.addEventListener('resize', this.setDimensionsOnState);
  }
  setDimensionsOnState() {
    // force a re-render
    this.setState({});
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
  _onChange() {
    if (this._layer) {
      var state = FeatureStore.getState(this._layer);
      if (!state) {
        delete this._layer;
        return;
      }
      this.setState(state);
    }
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
    if (!this._filtered) {
      if (this._selectedOnly === true) {
        FeatureStore.setSelectedAsFilter(lyr);
      } else {
        FeatureStore.restoreOriginalFeatures(lyr);
      }
    } else {
      FeatureStore.setFilter(lyr, this._filteredRows);
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
      if (extent[0] === extent[2]) {
        map.getView().setCenter([extent[0], extent[1]]);
        map.getView().setZoom(this.props.pointZoom);
      } else {
        map.getView().fit(extent, map.getSize());
      }
    }
  }
  _filterByText(evt) {
    const {formatMessage} = this.props.intl;
    var filterBy = evt.target.value;
    var state = FeatureStore.getState(this._layer);
    var rows = this._selectedOnly ? state.selected : state.features.getFeatures();
    var filteredRows = [];
    var queryFilter;
    if (filterBy !== '') {
      try {
        queryFilter = FilterService.filter(filterBy.replace(/'/g, '"'));
      } catch (e) {
        this.setState({
          errorOpen: true,
          error: true,
          msg: formatMessage(messages.errormsg, {msg: e.message})
        });
        queryFilter = null;
      }
      if (queryFilter !== null) {
        this.setState({
          errorOpen: false,
          error: false
        });
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
    } else {
      filteredRows = rows;
    }
    this._filtered = (rows.length !== filteredRows.length);
    this._filteredRows = filteredRows;
    FeatureStore.setFilter(this._layer, filteredRows);
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
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  _handleRequestCloseActive() {
    this.setState({
      active: false
    });
  }
  setActive(active) {
    this.setState({active: active});
  }
  _onSelect(props) {
    SelectActions.toggleFeature(this._layer, props.row);
  }
  _onTableChange(state, instance) {
    const {formatMessage} = this.props.intl;
    this.setState({loading: true});
    var start = state.page * state.pageSize;
    FeatureStore.loadFeatures(this._layer, start, state.pageSize, state.sorting, function() {
      this.setState({
        page: state.page,
        pageSize: state.pageSize,
        pages: Math.ceil(this._layer.get('numberOfFeatures') / state.pageSize),
        loading: false
      });
    }, function(xmlhttp, msg) {
      this.setState({
        error: true,
        errorOpen: true,
        msg: formatMessage(messages.loaderrormsg, {msg: msg || (xmlhttp.status + ' ' + xmlhttp.statusText)}),
        loading: false
      });
    }, this);
  }
  _onExpandChange(expanded) {
    var me = this;
    window.setTimeout(function() {
      me.setState({expanded: expanded}, function() {
        if (me.props.onUpdate) {
          me.props.onUpdate();
        }
      });
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var schema, id;
    if (this._layer) {
      schema = FeatureStore.getSchema(this._layer);
      id = this._layer.get('id');
    }
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        autoHideDuration={5000}
        style={{transitionProperty : 'none'}}
        bodyStyle={{lineHeight: '24px', height: 'auto'}}
        open={this.state.errorOpen}
        message={this.state.msg}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var me = this;
    var sortable = this.props.sortable;
    var columns = [{
      id: 'selector',
      header: '',
      sortable: sortable,
      render: function(props) {
        var selected = me.state.selected.indexOf(props.row) !== -1;
        return (<Checkbox disableTouchRipple={true} checked={selected} onCheck={me._onSelect.bind(me, props)} />);
      }
    }];
    for (var key in schema) {
      if (schema[key] === 'link') {
        columns.push({
          id: key,
          header: key,
          sortable: sortable,
          render: (function(props) {
            return (<a href={props.row.get(this)}>{props.row.get(this)}</a>);
          }).bind(key)
        });
      } else {
        columns.push({
          id: key,
          header: key,
          sortable: sortable,
          accessor: (function(d) {
            return d.get(this);
          }).bind(key)
        });
      }
    }
    var table;
    if (this._element && columns.length > 0 && this.state.features !== null) {
      var height = this.props.height ? this.props.height : this._element.offsetHeight - this._formNode.offsetHeight;
      if (this.state.expanded && this.props.height) {
        height = this.props.height - this._formNode.offsetHeight;
      }
      var data;
      if (this._filtered || this._selectedOnly) {
        data = this.state.filter;
      } else {
        if (this._layer instanceof ol.layer.Vector) {
          data = this.state.features.getFeatures();
        } else {
          data = FeatureStore.getFeaturesPerPage(this._layer, this.state.page, this.state.pageSize);
        }
      }
      table = (<ReactTable
        loading={this.state.loading}
        pages={this._layer instanceof ol.layer.Vector ? undefined : this.state.pages}
        data={data}
        manual={!(this._layer instanceof ol.layer.Vector)}
        showPageSizeOptions={false}
        onChange={(this._layer instanceof ol.layer.Vector) ? undefined : this._onTableChange.bind(this)}
        showPageJump={false}
        pageSize={this.state.pageSize}
        tableStyle={{width: '98%'}}
        style={{height: height, overflowY: 'auto'}}
        columns={columns}
      />);
    }
    const styles = this.getStyles();
    var filterHelp = this._layer ? <FilterHelp intl={this.props.intl} /> : undefined;
    return (
      <div style={styles.root} className={classNames('sdk-component feature-table', this.props.className)}>
        <Snackbar
          autoHideDuration={5000}
          open={!this._layer && this.state.active}
          bodyStyle={{lineHeight: '24px', height: 'auto'}}
          style={{bottom: 'auto', top: 0, position: 'absolute'}}
          message={formatMessage(messages.nodatamsg)}
          onRequestClose={this._handleRequestCloseActive.bind(this)}
        />
        <Card initiallyExpanded={!this.props.height} onExpandChange={this._onExpandChange.bind(this)} ref='form'>
          <CardHeader title={formatMessage(messages.optionslabel)} actAsExpander={true} showExpandableButton={true} />
          <CardText expandable={true}>
            <div className='feature-table-options'>
              <div className='feature-table-selector' style={{display: this.props.layer ? 'none' : 'block'}}>
                <LayerSelector {...this.props} id='table-layerSelector' disabled={!this._layer} ref='layerSelector' onChange={this._onLayerSelectChange.bind(this)} filter={this._filterLayerList} map={this.props.map} value={id} />
              </div>
              <div className='feature-table-filter' style={{display: this._layer instanceof ol.layer.Vector ? 'block' : 'none'}}>
                <TextField floatingLabelText={formatMessage(messages.filterlabel)} id='featuretable-filter' disabled={!this._layer} ref='filter' onChange={this._filterByText.bind(this)} hintText={formatMessage(messages.filterplaceholder)} />
                {filterHelp}
              </div>
              <Checkbox label={formatMessage(messages.onlyselected)} id='featuretable-onlyselected' disabled={!this._layer} checked={this._selectedOnly} onCheck={this._filter.bind(this)} disableTouchRipple={true}/>
            </div>
            <Toolbar className='feature-table-toolbar'>
              <RaisedButton disabled={!this._layer} icon={<ActionSearch />} label={formatMessage(messages.zoombuttontext)} tooltip={formatMessage(messages.zoombuttontitle)} onTouchTap={this._zoomSelected.bind(this)} disableTouchRipple={true}/>
              <RaisedButton disabled={!this._layer} icon={<ClearIcon />} label={formatMessage(messages.clearbuttontext)} tooltip={formatMessage(messages.clearbuttontitle)} onTouchTap={this._clearSelected.bind(this)} disableTouchRipple={true}/>
            </Toolbar>
          </CardText>
          {error}
        </Card>
        {table}
      </div>
    );
  }
}

export default injectIntl(FeatureTable, {withRef: true});
