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
import {DragSource, DropTarget} from 'react-dnd';
import ol from 'openlayers';
import Dialog from 'material-ui/Dialog';
import Button from './Button';
import FeatureTable from './FeatureTable';
import FilterModal from './FilterModal';
import classNames from 'classnames';
import LabelModal from './LabelModal';
import StyleModal from './StyleModal';
import LayerActions from '../actions/LayerActions';
import SLDService from '../services/SLDService';
import WMSService from '../services/WMSService';
import Slider from 'material-ui/Slider';
import Checkbox from 'material-ui/Checkbox';
import {ListItem} from 'material-ui/List';
import {RadioButton} from 'material-ui/RadioButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ZoomInIcon from 'material-ui/svg-icons/action/zoom-in';
import FilterIcon from 'material-ui/svg-icons/content/filter-list';
import LabelIcon from 'material-ui/svg-icons/content/text-format';
import StyleIcon from 'material-ui/svg-icons/image/brush';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import TableIcon from 'material-ui/svg-icons/action/view-list';
import WMSLegend from './WMSLegend';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import pureRender from 'pure-render-decorator';

const layerListItemSource = {
  canDrag(props, monitor) {
    return (props.allowReordering && props.layer.get('type') !== 'base' && props.layer.get('type') !== 'base-group');
  },
  beginDrag(props) {
    return {
      index: props.index,
      layer: props.layer,
      group: props.group
    };
  }
};

const layerListItemTarget = {
  hover(props, monitor, component) {
    if (props.layer.get('type') === 'base' || props.layer.get('type') === 'base-group') {
      return;
    }
    var sourceItem = monitor.getItem();
    const dragIndex = sourceItem.index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    var comp = ReactDOM.findDOMNode(component);
    if (!comp) {
      return;
    }
    const hoverBoundingRect = comp.getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveLayer(dragIndex, hoverIndex, sourceItem.layer, sourceItem.group);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource()
  };
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const messages = defineMessages({
  closebutton: {
    id: 'layerlist.closebutton',
    description: 'Text for close button',
    defaultMessage: 'Close'
  },
  tablemodaltitle: {
    id: 'layerlist.tablemodaltitle',
    description: 'Title for the table modal',
    defaultMessage: 'Table'
  },
  zoombuttonlabel: {
    id: 'layerlist.zoombuttonlabel',
    description: 'Tooltip for the zoom to layer button',
    defaultMessage: 'Zoom to layer'
  },
  downloadbuttonlabel: {
    id: 'layerlist.downloadbuttonlabel',
    description: 'Tooltip for the download layer button',
    defaultMessage: 'Download layer'
  },
  filterbuttonlabel: {
    id: 'layerlist.filterbuttonlabel',
    description: 'Tooltip for the zoom button',
    defaultMessage: 'Filter layer'
  },
  labelbuttonlabel: {
    id: 'layerlist.labelbuttonlabel',
    description: 'Tooltip for the label button',
    defaultMessage: 'Edit layer label'
  },
  stylingbuttonlabel: {
    id: 'layerlist.stylingbuttonlabel',
    description: 'Tooltip for the style layer button',
    defaultMessage: 'Edit layer style'
  },
  removebuttonlabel: {
    id: 'layerlist.removebuttonlabel',
    description: 'Tooltip for the remove layer button',
    defaultMessage: 'Remove layer'
  },
  editbuttonlabel: {
    id: 'layerlist.editbuttonlabel',
    description: 'Tooltip for the edit layer button',
    defaultMessage: 'Edit layer'
  },
  tablebuttonlabel: {
    id: 'layerlist.tablebuttonlabel',
    description: 'Tooltip for the table button',
    defaultMessage: 'Show table'
  }
});

/**
 * An item in the LayerList component.
 */
@pureRender
class LayerListItem extends React.Component {
  static propTypes = {
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    moveLayer: React.PropTypes.func.isRequired,
    index: React.PropTypes.number.isRequired,
    /**
     * The map in which the layer of this item resides.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * The layer associated with this item.
     */
    layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
    /**
     * The group layer to which this item might belong.
     */
    group: React.PropTypes.instanceOf(ol.layer.Group),
    /**
     * The feature format to serialize in for downloads.
     */
    downloadFormat: React.PropTypes.oneOf(['GeoJSON', 'KML', 'GPX']),
    /**
     * The title to show for the layer.
     */
    title: React.PropTypes.string.isRequired,
    /**
     * Should we show a button that can open up the feature table?
     */
    showTable: React.PropTypes.bool,
    /**
     * Should we show a zoom to button for the layer?
     */
    showZoomTo: React.PropTypes.bool,
    /**
     * Should we show allow reordering?
     */
    allowReordering: React.PropTypes.bool,
    /**
     * Should we allow for filtering of features in a layer?
     */
    allowFiltering: React.PropTypes.bool,
    /**
     * Should we allow for removal of layers?
     */
    allowRemove: React.PropTypes.bool,
    /**
     * Should we allow editing of features in a vector layer?
     */
    allowEditing: React.PropTypes.bool,
    /**
     * Should we allow for labeling of features in a layer?
     */
    allowLabeling: React.PropTypes.bool,
    /**
     * Should we allow for styling of features in a vector layer?
     */
    allowStyling: React.PropTypes.bool,
    /**
     * Should we show a download button?
     */
    showDownload: React.PropTypes.bool,
    /**
     * Should we include the legend in the layer list?
     */
    includeLegend: React.PropTypes.bool,
    /**
     * The nested items to show for this item.
     */
    nestedItems: React.PropTypes.array,
    /**
     * Should we show an opacity slider for the layer?
     */
    showOpacity: React.PropTypes.bool,
    /**
     * Called when a modal is opened by this layer list item.
     */
    onModalOpen: React.PropTypes.func,
    /**
     * Called when a modal is closed by this layer list item.
     */
    onModalClose: React.PropTypes.func,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * i18n message strings. Provided through the application through context.
     */
    intl: intlShape.isRequired
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    connectDragSource: function(a) {
      return a;
    },
    connectDropTarget: function(a) {
      return a;
    }
  };

  constructor(props) {
    super(props);
    if (this.props.group) {
      if (this.props.group.get('type') === 'base-group') {
        this.props.group.on('change:visible', function(evt) {
          this.setState({disabled: !evt.target.getVisible()});
        }, this);
      } else {
        this.props.group.on('change:visible', function(evt) {
          this.setState({checked: evt.target.getVisible()});
        }, this);
      }
    }
    this.formats_ = {
      GeoJSON: {
        format: new ol.format.GeoJSON(),
        mimeType: 'text/json',
        extension: 'geojson'
      },
      KML: {
        format: new ol.format.KML(),
        mimeType: 'application/vnd.google-earth.kml+xml',
        extension: 'kml'
      },
      GPX: {
        format: new ol.format.GPX(),
        mimeType: 'application/gpx+xml',
        extension: 'gpx'
      }
    };
    this.state = {
      tableOpen: false,
      checked: props.layer.getVisible()
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }
  componentDidMount() {
    this.props.layer.on('change:visible', this._changeLayerVisible, this);
  }
  componentWillUnmount() {
    this.props.layer.un('change:visible', this._changeLayerVisible, this);
  }
  _changeLayerVisible(evt) {
    this.setState({checked: evt.target.getVisible()});
  }
  _handleChange(event) {
    var visible = event.target.checked;
    var i, ii;
    if (event.target.type === 'radio') {
      var forEachLayer = function(layers, layer) {
        if (layer instanceof ol.layer.Group) {
          layer.getLayers().forEach(function(groupLayer) {
            forEachLayer(layers, groupLayer);
          });
        } else if (layer.get('type') === 'base') {
          layers.push(layer);
        }
      };
      var baseLayers = [];
      forEachLayer(baseLayers, this.props.map.getLayerGroup());
      for (i = 0, ii = baseLayers.length; i < ii; ++i) {
        baseLayers[i].setVisible(false);
      }
      this.props.layer.setVisible(true);
    } else {
      this.props.layer.setVisible(visible);
      if (this.props.layer instanceof ol.layer.Group) {
        if (this.props.layer.get('type') === 'base-group') {
          if (visible === false) {
            this.props.layer.getLayers().forEach(function(child) {
              if (child.getVisible() === true) {
                this._child = child;
              }
              child.setVisible(visible);
            }, this);
          } else {
            // restore the last visible child of the group
            this._child.setVisible(visible);
            delete this._child;
          }
        } else {
          this.props.layer.getLayers().forEach(function(child) {
            child.setVisible(visible);
          }, this);
        }
      }
    }
  }
  _download() {
    var formatInfo = this.formats_[this.props.downloadFormat];
    var format = formatInfo.format;
    var layer = this.props.layer;
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    var features = source.getFeatures();
    var output = format.writeFeatures(features, {featureProjection: this.props.map.getView().getProjection()});
    var dl = document.createElement('a');
    var mimeType = formatInfo.mimeType;
    dl.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(output));
    dl.setAttribute('download', layer.get('title') + '.' + formatInfo.extension);
    dl.click();
  }
  _filter() {
    if (this.props.onModalOpen) {
      this.props.onModalOpen.call();
    }
    this.refs.filtermodal.getWrappedInstance().open();
  }
  _label() {
    this.refs.labelmodal.getWrappedInstance().open();
  }
  _style() {
    if (!this.props.layer.get('styleInfo')) {
      var sld_body = this.props.layer.getSource().getParams().SLD_BODY;
      if (sld_body) {
        this.props.layer.set('styleInfo', SLDService.parse(sld_body));
        this.refs.stylemodal.getWrappedInstance().open();
      } else {
        var me = this;
        WMSService.getStyles(this.props.layer.get('wfsInfo').url, this.props.layer, function(info) {
          me.props.layer.set('styleInfo', info);
          me.refs.stylemodal.getWrappedInstance().open();
        }, undefined);
      }
    } else {
      this.refs.stylemodal.getWrappedInstance().open();
    }
  }
  _modifyLatLonBBOX(bbox) {
    bbox[0] = Math.max(-180, bbox[0]);
    bbox[1] = Math.max(-85, bbox[1]);
    bbox[2] = Math.min(180, bbox[2]);
    bbox[3] = Math.min(85, bbox[3]);
    return bbox;
  }
  _showTable() {
    this.setState({
      tableOpen: true
    });
  }
  _closeTable() {
    this.setState({
      tableOpen: false
    });
  }
  _zoomTo() {
    var map = this.props.map;
    var view = map.getView();
    var extent = this.props.layer.get('EX_GeographicBoundingBox');
    if (view.getProjection().getCode() === 'EPSG:3857') {
      this._modifyLatLonBBOX(extent);
    }
    extent = ol.proj.transformExtent(extent, 'EPSG:4326', view.getProjection());
    if (!extent) {
      extent = this.props.layer.getSource().getExtent();
    }
    map.getView().fit(
      extent,
      map.getSize()
    );
  }
  _remove() {
    LayerActions.removeLayer(this.props.layer, this.props.group);
  }
  _edit() {
    LayerActions.editLayer(this.props.layer);
  }
  _changeOpacity(evt, value) {
    this.props.layer.setOpacity(value);
  }
  _onTableUpdate() {
    this.refs.tablemodal.forceUpdate();
  }
  render() {
    const {connectDragSource, connectDropTarget} = this.props;
    const layer = this.props.layer;
    const source = layer.getSource ? layer.getSource() : undefined;
    const iconStyle = {'paddingTop':'0px', 'paddingBottom':'0px'};
    const {formatMessage} = this.props.intl;
    var opacity;
    if (this.props.showOpacity && source && layer.get('type') !== 'base') {
      var val = layer.getOpacity();
      opacity = (<Slider style={{width: '200px', 'marginLeft':'21px', 'marginTop':'4px', 'marginBottom':'0px'}} defaultValue={val} onChange={this._changeOpacity.bind(this)} />);
    }
    var table;
    if (this.props.showTable && (this.props.layer instanceof ol.layer.Vector || this.props.layer.get('wfsInfo') !== undefined)) {
      table = (<Button className='layer-list-item-table' onTouchTap={this._showTable.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.tablebuttonlabel)}><TableIcon /></Button>);
    }
    var zoomTo;
    if (layer.get('type') !== 'base' && layer.get('type') !== 'base-group' && ((source && source.getExtent) || layer.get('EX_GeographicBoundingBox')) && this.props.showZoomTo) {
      zoomTo = (<Button className='layer-list-item-zoom' onTouchTap={this._zoomTo.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.zoombuttonlabel)}><ZoomInIcon /></Button>);
    }
    var download;
    if (layer instanceof ol.layer.Vector && this.props.showDownload) {
      download = (<Button className='layer-list-item-download' onTouchTap={this._download.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.downloadbuttonlabel)}><DownloadIcon /></Button>);
    }
    var filter;
    if (layer instanceof ol.layer.Vector && this.props.allowFiltering) {
      filter = (<Button className='layer-list-item-filter' onTouchTap={this._filter.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.filterbuttonlabel)}><FilterIcon /></Button>);
    }
    var label;
    if (layer instanceof ol.layer.Vector && this.props.allowLabeling) {
      label = (<Button className='layer-list-item-label' onTouchTap={this._label.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.labelbuttonlabel)} ><LabelIcon /></Button>);
    }
    var styling;
    var canStyle = layer.get('wfsInfo') && this.props.allowStyling;
    if (canStyle) {
      styling = (<Button className='layer-list-item-style' onTouchTap={this._style.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.stylingbuttonlabel)} ><StyleIcon /></Button>);
    }
    var remove;
    if (this.props.allowRemove && layer.get('type') !== 'base' && layer.get('isRemovable') === true) {
      remove = (<Button className='layer-list-item-remove' onTouchTap={this._remove.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.removebuttonlabel)} ><DeleteIcon /></Button>);
    }
    var edit;
    if (this.props.allowEditing && layer.get('isWFST') === true) {
      edit = (<Button className='layer-list-item-edit' onTouchTap={this._edit.bind(this)} tooltipPosition='top' style={iconStyle} buttonType='Icon' tooltip={formatMessage(messages.editbuttonlabel)} ><EditIcon /></Button>);
    }
    var buttonPadding;
    if (zoomTo || download || filter || label || styling || remove || edit || table) {
      buttonPadding = (<div style={{'display':'inline-block','width':'26px'}} />);
    }
    var input;
    if (layer.get('type') === 'base') {
      input = (<RadioButton disabled={this.state.disabled} checked={this.state.checked} label={this.props.title} value={this.props.title} onCheck={this._handleChange.bind(this)} disableTouchRipple={true}/>);
    } else {
      input = (<Checkbox checked={this.state.checked} label={this.props.title} labelStyle={this.props.layer.get('emptyTitle') ? {fontStyle: 'italic'} : undefined} onCheck={this._handleChange.bind(this)} disableTouchRipple={true}/>);
    }
    var tableModal, labelModal, filterModal, styleModal;
    if (this.props.layer instanceof ol.layer.Vector) {
      labelModal = (<LabelModal {...this.props} layer={this.props.layer} ref='labelmodal' />);
      filterModal = (<FilterModal {...this.props} layer={this.props.layer} ref='filtermodal' />);
    }
    if (canStyle) {
      styleModal = (<StyleModal {...this.props} layer={this.props.layer} ref='stylemodal' />);
    }
    if (this.props.showTable) {
      var actions = [
        <Button buttonType='Flat' label={formatMessage(messages.closebutton)} onTouchTap={this._closeTable.bind(this)} />
      ];
      tableModal = (
        <Dialog ref='tablemodal' actions={actions} title={formatMessage(messages.tablemodaltitle)} open={this.state.tableOpen} onRequestClose={this._closeTable.bind(this)}>
          <FeatureTable height={400} onUpdate={this._onTableUpdate.bind(this)} map={this.props.map} layer={this.props.layer} />
        </Dialog>
      );
    }
    var legend;
    if (this.props.includeLegend && this.props.layer.getVisible() && ((this.props.layer instanceof ol.layer.Tile && this.props.layer.getSource() instanceof ol.source.TileWMS) ||
      (this.props.layer instanceof ol.layer.Image && this.props.layer.getSource() instanceof ol.source.ImageWMS))) {
      legend = <WMSLegend layer={this.props.layer} />;
    }
    return connectDragSource(connectDropTarget(
      <div>
        <ListItem className={classNames({'sdk-component': true, 'layer-list-item': true}, this.props.className)} innerDivStyle={{'paddingTop':'8px','paddingBottom':'8px'}} autoGenerateNestedIndicator={false} primaryText={input ? undefined : this.props.title} nestedItems={this.props.nestedItems} nestedListStyle={{'marginLeft':'40px'}} initiallyOpen={true} disableTouchRipple={true}>
          {input}
          {legend}
          {opacity}
          {buttonPadding}
          {zoomTo}
          {table}
          {download}
          {filter}
          {label}
          {styling}
          {remove}
          {edit}
          <span>
            {filterModal}
            {labelModal}
            {styleModal}
            {tableModal}
          </span>
        </ListItem>
      </div>
    ));
  }
}

export default injectIntl(DropTarget('layerlistitem', layerListItemTarget, collectDrop)(DragSource('layerlistitem', layerListItemSource, collect)(LayerListItem)));
