/* Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
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
import { DragSource, DropTarget } from 'react-dnd';
import Dialog from './Dialog';
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
import { ListItem } from 'material-ui/List';
import WMSLegend from './WMSLegend';
import ArcGISRestLegend from './ArcGISRestLegend';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import FileSaver from 'file-saver';
import { createDragPreview } from 'react-dnd-text-dragpreview';

const layerListItemSource = {

  canDrag(props, monitor) {
    return(props.layer.get('canDrag') !== false && props.allowReordering && props.layer.get('type') !== 'base' && props.layer.get('type') !== 'base-group');
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
    if(props.layer.get('type') === 'base' || props.layer.get('type') === 'base-group') {
      return;
    }
    var sourceItem = monitor.getItem();
    const dragIndex = sourceItem.index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if(dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    var comp = ReactDOM.findDOMNode(component);
    if(!comp) {
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
    if(dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if(dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveLayer(dragIndex, hoverIndex, sourceItem.layer, sourceItem.group);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  };
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const dragPreviewStyleDefault = {
  backgroundColor: 'rgb(68, 67, 67)',
  color: 'white',
  fontSize: 14,
  paddingTop: 4,
  paddingRight: 7,
  paddingBottom: 6,
  paddingLeft: 7,
  fontFamily: 'Roboto'
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
  },
  draglayerlabel: {
    id: 'layerlist.draglayerlabel',
    description: 'Text on label when dragging',
    defaultMessage: 'Moving Layer'
  }
});

/**
$$src/components/LayerListItemDetail.md$$
 */
class LayerListItemRedux extends React.Component {
  static propTypes = {
    /**
     * @ignore
     */
    connectDragSource: React.PropTypes.func.isRequired,
    /**
     * @ignore
     */
    connectDragPreview: React.PropTypes.func.isRequired,
    /**
     * @ignore
     */
    connectDropTarget: React.PropTypes.func.isRequired,
    /**
     * @ignore
     */
    isDragging: React.PropTypes.bool,
    /**
     * @ignore
     */
    Item: React.PropTypes.object,
    /**
     * @ignore
     */
    moveLayer: React.PropTypes.func.isRequired,
    /**
     * @ignore
     */
    index: React.PropTypes.number.isRequired,
    /**
     * The map in which the layer of this item resides.
     */
    // map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * The layer associated with this item.
     */
    layer: React.PropTypes.object,
    // /**
    //  * The group layer to which this item might belong.
    //  */
    // group: React.PropTypes.instanceOf(ol.layer.Group),
    // /**
    //  * The feature format to serialize in for downloads.
    //  */
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
     * Should groups be collapsible?
     */
    collapsible: React.PropTypes.bool,
    /**
     * The nested items to show for this item.
     */
    nestedItems: React.PropTypes.array,
    /**
     * Should we show an opacity slider for the layer?
     */
    showOpacity: React.PropTypes.bool,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Style config for when label is out of scale.
     */
    labelStyleOutOfScale: React.PropTypes.object,
    /**
     * Should we handle resolution changes to show when a layer is in or out of scale?
     */
    handleResolutionChange: React.PropTypes.bool,
    /**
     * Should dialogs show inline instead of a modal?
     */
    inlineDialogs: React.PropTypes.bool,
    /**
     *  State from parent component to manage baseLayers
     */
    currentBaseLayer: React.PropTypes.string,
    /**
     *  Style for text of dragged layer
     */
    dragPreviewStyle: React.PropTypes.object,
    /**
     *  Callback from parent component to manage baseLayers
     */
    setBaseLayer: React.PropTypes.func,
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
    connectDragSource: function(a) {
      return a;
    },
    connectDropTarget: function(a) {
      return a;
    },
    connectDragPreview: function(a) {
      return a;
    }
  };
  constructor(props, context) {
    super(props);
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    this._muiTheme = context.muiTheme || getMuiTheme();
    //TODO: move to redux state
    this.state = {
      filterOpen: false,
      labelOpen: false,
      tableOpen: false,
      open: (props.layer.isGroupExpanded === false) ? false : true,
      styleOpen: false,
      checked: props.layer.visible,
      previousBase: ''
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
}
export default injectIntl(DragDropContext(HTML5Backend)(LayerListItemRedux));
