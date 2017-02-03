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
import ol from 'openlayers';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import TextField from 'material-ui/TextField';
import Button from './Button';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import WMSService from '../services/WMSService';
import WFSService from '../services/WFSService';
import ArcGISRestService from '../services/ArcGISRestService';
import WMTSService from '../services/WMTSService';
import CircularProgress from 'material-ui/CircularProgress';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import classNames from 'classnames';
import './AddLayerModal.css';

const messages = defineMessages({
  servertypelabel: {
    id: 'addwmslayermodal.servertypelabel',
    description: 'Label for the combo for server type',
    defaultMessage: 'Type'
  },
  newservername: {
    id: 'addwmslayermodal.newservername',
    description: 'Title for new server name text field',
    defaultMessage: 'Name'
  },
  newserverurl: {
    id: 'addwmslayermodal.newserverurl',
    description: 'Title for new server url text field',
    defaultMessage: 'URL'
  },
  newservermodaltitle: {
    id: 'addwmslayermodal.newservermodaltitle',
    description: 'Modal title for add new server',
    defaultMessage: 'Add Server'
  },
  addserverbutton: {
    id: 'addwmslayermodal.addserverbutton',
    description: 'Text for add server button',
    defaultMessage: 'Add'
  },
  refresh: {
    id: 'addwmslayermodal.refresh',
    description: 'Refresh tooltip',
    defaultMessage: 'Refresh Layers'
  },
  title: {
    id: 'addwmslayermodal.title',
    description: 'Title for the modal Add layer dialog',
    defaultMessage: 'Add Layers'
  },
  nolayertitle: {
    id: 'addwmslayermodal.nolayertitle',
    description: 'Title to show if layer has no title',
    defaultMessage: 'No Title'
  },
  filtertitle: {
    id: 'addwmslayermodal.filtertitle',
    description: 'Title for the filter field',
    defaultMessage: 'Filter'
  },
  errormsg: {
    id: 'addwmslayermodal.errormsg',
    description: 'Error message to show the user when an XHR request fails',
    defaultMessage: 'Error. {msg}'
  },
  corserror: {
    id: 'addwmslayermodal.corserror',
    description: 'Error message to show the user when an XHR request fails because of CORS or offline',
    defaultMessage: 'Could not connect to the server. Please verify that the server is online and/or CORS is enabled.'
  },
  inputfieldlabel: {
    id: 'addwmslayermodal.inputfieldlabel',
    description: 'Label for input field',
    defaultMessage: '{serviceType} URL'
  },
  connectbutton: {
    id: 'addwmslayermodal.connectbutton',
    description: 'Text for connect button',
    defaultMessage: 'Connect'
  },
  addbutton: {
    id: 'addwmslayermodal.addbutton',
    description: 'Text for the add button',
    defaultMessage: 'Add'
  },
  closebutton: {
    id: 'addwmslayermodal.closebutton',
    description: 'Text for close button',
    defaultMessage: 'Close'
  }
});

/**
 * Modal window to add layers from a WMS, WFS, WMTS or ArcGIS REST service.
 *
 * ```xml
 * <AddLayerModal map={map} allowUserInput={true} sources={[{url: '/geoserver/wms', type: 'WMS', title: 'Local GeoServer'}]} />
 * ```
 *
 * ![Add Layer Modal](../AddLayerModal.png)
 */
class AddLayerModal extends React.PureComponent {
  static propTypes = {
    /**
     * The ol3 map to add layers to.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the dialog.
     */
    className: React.PropTypes.string,
    /**
     * List of sources to use for this dialog. Entries have a title, type and url property. Type can be one of: WMS, WFS, WMTS or ArcGISRest.
     */
    sources: React.PropTypes.arrayOf(React.PropTypes.shape({
      title: React.PropTypes.string.isRequired,
      type: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired
    })),
    /**
     * Should be user be able to provide their own url?
     */
    allowUserInput: React.PropTypes.bool,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object,
    proxy: React.PropTypes.string,
    requestHeaders: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    allowUserInput: false
  };

  constructor(props, context) {
    super(props);
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    this._muiTheme = context.muiTheme || getMuiTheme();
    this.state = {
      loading: false,
      sources: this.props.sources.slice(),
      newType: AddLayerModal.addNewTypes[0],
      newModalOpen: false,
      source: 0,
      filter: null,
      error: false,
      errorOpen: false,
      open: false,
      layerInfo: null
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentWillUnmount() {
    if (this._request) {
      this._request.abort();
    }
  }
  static addNewTypes = [
    'WMS',
    'WFS',
    'ArcGISRest',
    'WMTS'
  ];
  static services = {
    'WMS': WMSService,
    'WFS': WFSService,
    'ArcGISRest': ArcGISRestService,
    'WMTS': WMTSService
  };
  _getCaps(onFailure) {
    this.setState({loading: true, layerInfo: null});
    var source = this.state.sources[this.state.source];
    var url = source.url;
    var service = AddLayerModal.services[source.type];
    var me = this;
    const {formatMessage} = this.props.intl;
    var failureCb = function(xmlhttp) {
      delete me._request;
      if (!xmlhttp || xmlhttp.status === 0) {
        me._setError(formatMessage(messages.corserror));
      } else {
        me._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
      }
      if (onFailure) {
        onFailure();
      }
    };
    var successCb = function(layerInfo, onlineResource) {
      delete me._request;
      source.getMapUrl = onlineResource;
      me.setState({loading: false, layerInfo: layerInfo});
    };
    me._request = service.getCapabilities(url, successCb, failureCb, this._proxy, this._requestHeaders);
  }
  _setError(msg) {
    this.setState({
      loading: false,
      errorOpen: true,
      error: true,
      layerInfo: null,
      msg: msg
    });
  }
  _getLayerTitle(layer) {
    const {formatMessage} = this.props.intl;
    if (layer.Title === '') {
      return {empty: true, title: formatMessage(messages.nolayertitle)};
    } else {
      return {empty: false, title: layer.Title};
    }
  }
  _onLayerClick(layer) {
    var map = this.props.map;
    var titleObj = this._getLayerTitle(layer);
    var source = this.state.sources[this.state.source];
    var url = source.getMapUrl || source.url;
    var service = AddLayerModal.services[source.type];
    var olLayer = service.createLayer(layer, url, titleObj, map.getView().getProjection(), this._proxy);
    if (olLayer.get('type') === 'base') {
      var foundGroup = false;
      map.getLayers().forEach(function(lyr) {
        if (foundGroup === false && lyr.get('type') === 'base-group') {
          foundGroup = true;
          lyr.getLayers().forEach(function(child) {
            child.setVisible(false);
          });
          lyr.getLayers().push(olLayer);
        }
      });
      if (foundGroup === false) {
        map.addLayer(olLayer);
      }
    } else {
      map.addLayer(olLayer);
    }
    return olLayer;
  }
  _getLayersMarkup(layer) {
    var filter = this.state.filter;
    var childList;
    if (layer.Layer) {
      var children = layer.Layer.map(function(child) {
        return this._getLayersMarkup(child);
      }, this);
      childList = children;
    }
    var onCheck;
    if (layer.Name !== undefined) {
      onCheck = this._onCheck.bind(this, layer);
    }
    var layerTitle = this._getLayerTitle(layer);
    var primaryText;
    if (layerTitle.empty) {
      primaryText = (<div className='layer-title-empty'>{layerTitle.title}</div>);
    } else {
      primaryText = layerTitle.title;
    }
    var displayValue = 'block';
    var search = [layer.Title];
    if (layer.Abstract !== undefined) {
      search.push(layer.Abstract);
    }
    if (layer.KeywordList) {
      search = search.concat(layer.KeywordList);
    }
    if (filter !== null) {
      var match = false;
      for (var i = 0, ii = search.length; i < ii; ++i) {
        if (search[i].toUpperCase().indexOf(filter.toUpperCase()) !== -1) {
          match = true;
          break;
        }
      }
      if (match === false) {
        displayValue = 'none';
      }
    }
    return (
      <ListItem style={{display: displayValue}} leftCheckbox={<Checkbox onCheck={onCheck} />} initiallyOpen={true} key={layer.Name} primaryText={primaryText} secondaryText={layer.Name} nestedItems={childList} />
    );
  }
  _onCheck(layer, proxy, checked) {
    if (checked) {
      this._checkedLayers.push(layer);
    } else {
      var idx = this._checkedLayers.indexOf(layer)
      if (idx > -1) {
        this._checkedLayers.splice(idx, 1);
      }
    }
  }
  open() {
    this._getCaps();
    this.setState({open: true});
  }
  close() {
    this.setState({open: false});
  }
  addLayers() {
    var doZoom = false;
    var initial = ol.extent.createEmpty();
    var finalExtent;
    for (var i = 0, ii = this._checkedLayers.length; i < ii; ++i) {
      var layer = this._onLayerClick(this._checkedLayers[i]);
      var extent = layer.get('EX_GeographicBoundingBox');
      if (extent) {
        finalExtent = ol.extent.extend(initial, extent);
        doZoom = true;
      }
    }
    if (doZoom) {
      var map = this.props.map;
      var view = map.getView();
      map.getView().fit(ol.proj.transformExtent(finalExtent, 'EPSG:4326', view.getProjection()), map.getSize());
    }
    this.close();
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  _onFilterChange(proxy, value) {
    this.setState({filter: value});
  }
  _onTypeChange(evt, idx, value) {
    this.setState({newType: value});
  }
  _onSourceChange(evt, idx, value) {
    if (value === 'new') {
      this.setState({newModalOpen: true});
    } else {
      this.setState({source: value}, function() {
        this._refreshService();
      }, this);
    }
  }
  closeNewServer() {
    this.setState({newModalOpen: false});
  }
  _refreshService(onFailure) {
    this._getCaps(onFailure);
  }
  addServer() {
    var name = this.refs.newservername.getValue();
    var url = this.refs.newserverurl.getValue();
    var serverType = this.state.newType;
    var sources = this.state.sources.slice();
    if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1 && url[0] !== '/') {
      url = 'http://' + url;
    }
    sources.push({
      title: name,
      type: serverType,
      url: url
    });
    this.setState({source: sources.length - 1, newModalOpen: false, sources: sources}, function() {
      var me = this;
      this._refreshService(function() {
        var sources = me.state.sources.slice();
        sources.splice(-1, 1);
        me.setState({sources: sources, source: sources.length - 1}, function() {
          me._refreshService();
        });
      });
    }, this);
  }
  render() {
    var selectOptions = this.state.sources.map(function(source, idx) {
      return (<MenuItem key={idx} value={idx} primaryText={source.title} />);
    });
    var typeOptions = AddLayerModal.addNewTypes.map(function(newType) {
      return (<MenuItem key={newType} value={newType} primaryText={newType} />);
    });
    if (this.props.allowUserInput) {
      selectOptions.push(<MenuItem key='new' value='new' primaryText='Add New Server' />);
    }
    this._checkedLayers = [];
    const {formatMessage} = this.props.intl;
    var layers;
    if (this.state.layerInfo) {
      var layerInfo = this._getLayersMarkup(this.state.layerInfo);
      layers = <List>{layerInfo}</List>;
    }
    var loadingIndicator;
    if (this.state.loading === true) {
      loadingIndicator = (<CircularProgress size={50} thickness={3} />);
    }
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        autoHideDuration={5000}
        style={{transitionProperty : 'none'}}
        bodyStyle={{lineHeight: '24px', height: 'auto'}}
        open={this.state.errorOpen}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var actions = [
      <Button buttonType='Flat' primary={true} label={formatMessage(messages.addbutton)} onTouchTap={this.addLayers.bind(this)} />,
      <Button buttonType='Flat' label={formatMessage(messages.closebutton)} onTouchTap={this.close.bind(this)} />
    ];
    var newActions = [
      <Button buttonType='Flat' primary={true} label={formatMessage(messages.addserverbutton)} onTouchTap={this.addServer.bind(this)} />,
      <Button buttonType='Flat' label={formatMessage(messages.closebutton)} onTouchTap={this.closeNewServer.bind(this)} />
    ];
    return (
      <Dialog className={classNames('sdk-component add-layer-modal', this.props.className)}  actions={actions} autoScrollBodyContent={true} modal={true} title={formatMessage(messages.title)} open={this.state.open} onRequestClose={this.close.bind(this)}>
        <SelectField value={this.state.source} onChange={this._onSourceChange.bind(this)}>
          {selectOptions}
        </SelectField><Button buttonType='Icon' key='refresh' tooltip={formatMessage(messages.refresh)} onTouchTap={this._refreshService.bind(this)}><RefreshIcon /></Button><br/>
        <Dialog open={this.state.newModalOpen} actions={newActions} autoScrollBodyContent={true} onRequestClose={this.closeNewServer.bind(this)} modal={true} title={formatMessage(messages.newservermodaltitle)}>
          <SelectField floatingLabelText={formatMessage(messages.servertypelabel)} value={this.state.newType} onChange={this._onTypeChange.bind(this)}>{typeOptions}</SelectField><br/>
          <TextField fullWidth={true} ref='newservername' floatingLabelText={formatMessage(messages.newservername)} /><br/>
          <TextField fullWidth={true} ref='newserverurl' floatingLabelText={formatMessage(messages.newserverurl)} />
        </Dialog>
        <TextField floatingLabelText={formatMessage(messages.filtertitle)} onChange={this._onFilterChange.bind(this)} />
        {layers}
        {loadingIndicator}
        {error}
      </Dialog>
    );
  }
}

export default injectIntl(AddLayerModal, {withRef: true});
