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
import debounce from  'debounce';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import LayerIdService from '../services/LayerIdService';
import Label from './Label';
import AddLayerModal from './AddLayerModal';
import BaseMapModal from './BaseMapModal';
import Button from './Button';
import {List} from 'material-ui/List';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Paper from 'material-ui/Paper';
import './LayerList.css';

const messages = defineMessages({
  layertitle: {
    id: 'layerlist.layertitle',
    description: 'List of layers',
    defaultMessage: 'Layers'
  },
  addlayertitle: {
    id: 'layerlist.addlayertitle',
    description: 'Title for Add layers button',
    defaultMessage: 'Add layers'
  },
  addlayertext: {
    id: 'layerlist.addlayertext',
    description: 'Text for Add layers button',
    defaultMessage: ' Add Layer'
  },
  addbasemaptext: {
    id: 'layerlist.addbasemaptext',
    description: 'Text for Add BaseMap button',
    defaultMessage: ' BaseMap'
  }
});
/**
 * $$src/components/LayerListDetail.md$$
 *
 */
class LayerListRedux extends React.PureComponent {
  static propTypes = {
    /**
     * Should we allow upload of vector layers?
     */
    showUpload: React.PropTypes.bool,
    /**
     * Should we allow creation of new vector layers?
     */
    showNew: React.PropTypes.bool,
    /**
     * The map whose layers should show up in this layer list.
     */
    map: React.PropTypes.object,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * Should we show a button that allows the user to zoom to the layer's extent?
     */
    showZoomTo: React.PropTypes.bool,
    /**
     * Should we show a button that can open up the feature table?
     */
    showTable: React.PropTypes.bool,
    /**
     * Should we allow for reordering of layers?
     */
    allowReordering: React.PropTypes.bool,
    /**
     * Should we allow for filtering of features in a layer?
     */
    allowFiltering: React.PropTypes.bool,
    /**
     * Should we allow for labeling of features in a layer?
     */
    allowLabeling: React.PropTypes.bool,
    /**
     * Should we allow for styling of features in a vector layer?
     */
    allowStyling: React.PropTypes.bool,
    /**
     * Should we allow for editing of features in a vector layer?
     * This does require having a WFST component in your application.
     */
    allowEditing: React.PropTypes.bool,
    /**
     * Should we allow for removal of layers?
     */
    allowRemove: React.PropTypes.bool,
    /**
     * Should we show a download button for layers?
     */
    showDownload: React.PropTypes.bool,
    /**
     * Should we include the legend in the layer list?
     */
    includeLegend: React.PropTypes.bool,
    /**
     * The feature format to serialize in for downloads.
     */
    downloadFormat: React.PropTypes.oneOf(['GeoJSON', 'KML', 'GPX']),
    /**
     * Should we show an opacity slider for layers?
     */
    showOpacity: React.PropTypes.bool,
    /**
     * Text to show on top of layers.
     */
    tipLabel: React.PropTypes.string,
    /**
     * Should we show this component on start of the application?
     */
    showOnStart: React.PropTypes.bool,
    /**
     * Should groups be collapsible?
     */
    collapsible: React.PropTypes.bool,
    /**
     * Icon for the component
     */
    icon: React.PropTypes.node,
    /**
     * Add basemap functionality that adds a button that will open the BaseMapModal componenet
     */
    addBaseMap: React.PropTypes.bool,
    /**
    *  Tile services for the BaseMapModal component.  There is a built in default tileService if none provided
    */
    baseMapTileServices: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      endpoint: React.PropTypes.string,
      standard: React.PropTypes.string.isRequired,
      attribution: React.PropTypes.string,
      thumbnail: React.PropTypes.string.isRequired
    })),
    /**
     * Should we allow adding layers?
     */
    addLayer: React.PropTypes.shape({
      sources: React.PropTypes.arrayOf(React.PropTypes.shape({
        title: React.PropTypes.string.isRequired,
        type: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired,
        properties: React.PropTypes.object
      })),
      allowUserInput: React.PropTypes.bool
    }),
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Minimum width as a number of a LayerList, this is mainly an issue on ie11
     */
    minWidth: React.PropTypes.number,
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * A filter function to filter out some of the layers by returning false.
     */
    filter: React.PropTypes.func,
    /**
     * Style config for when label is out of scale.
     */
    labelStyleOutOfScale: React.PropTypes.object,
    /**
     * Should we handle resolution changes to show when a layer is in or out of scale?
     */
    handleResolutionChange: React.PropTypes.bool,
    /**
     * @ignore
     */
    children: React.PropTypes.node,
    /**
     * Should dialogs show inline instead of a modal?
     */
    inlineDialogs: React.PropTypes.bool,
    /**
    * @ignore
    */
    intl: intlShape.isRequired
  };
  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    inlineDialogs: false,
    handleResolutionChange: true,
    labelStyleOutOfScale: {
      color: '#BBBBBB'
    },
    showZoomTo: false,
    showTable: false,
    allowReordering: false,
    allowEditing: false,
    allowFiltering: false,
    allowLabeling: false,
    allowRemove: true,
    allowStyling: false,
    showDownload: false,
    downloadFormat: 'GeoJSON',
    includeLegend: false,
    showOpacity: false,
    showOnStart: false,
    collapsible: true,
    minWidth:360
  };
  constructor(props, context) {
    super(props);
    //TODO: Move to redux state
    this.state = {
      visible: props.showOnStart,
      addLayerOpen: false,
      muiTheme: context.muiTheme || getMuiTheme(),
      baseLayer: ''
    };
    this.moveLayer = debounce(this.moveLayer, 100);
  }
 componentWillMount() {
   //TODO: Setup state listeners
   if (this.props.inlineDialogs) {
     this.setState({visible: true});
   }
 }
 componentWillUnmount() {
   //TODO: Remove state listeners
 }
 componentDidMount() {
   var forEachLayer = function(layers, layer) {
     if (layer.type === 'Group') {
       layer.getLayers().forEach(function(groupLayer) {
         forEachLayer(layers, groupLayer);
       });
     } else if (layer.properties.type === 'base') {
       layers.push(layer);
     }
   };
   var baseLayers = [];
   forEachLayer(baseLayers, this.props.map.getLayerGroup());
   if (baseLayers.length > 0) {
     for (var i = 0; i < baseLayers.length; i++) {
       baseLayers[i].setVisible(false);
     }
     baseLayers[0].setVisible(true);
     this.setState({baseLayer: baseLayers[0].get('id')});
   }
 }
 _onChange() {
   //TODO: Build on change
  //  this.setState(LayerStore.getState());
 }
 renderLayerGroup(group) {
   return this.renderLayers(group.getLayers().getArray().slice(0).reverse(), group);
 }
 renderLayers(layers, group) {
   //TODO: Move to filter in state
   var me = this;
   var layerNodes = [];
   for (var i = 0, ii = layers.length; i < ii; ++i) {
     var lyr = layers[i];
     if (!this.props.filter || this.props.filter(lyr) === true) {
       layerNodes.push(me.getLayerNode(lyr, group, (ii - i) - 1));
     }
   }
   return layerNodes;
 }
 _showAddLayer() {
   //TODO: move to redux state
   this.setState({
     addLayerOpen: true
   });
 }
 _closeAddLayer() {
   //TODO: move to redux state
   this.setState({
     addLayerOpen: false
   });
 }
 _togglePanel() {
   //TODO: move to redux state
   var newVisible = !this.state.visible;
   if (newVisible || this._modalOpen !== true) {
     this.setState({visible: newVisible});
   }
 }
 _setBaseLayer(layer) {
   //TODO: move to redux state
   this.setState({baseLayer: layer});
 }
 //TODO: continue with line 319 and getLayerNode
 render() {
   return (
     <div>Layer</div>
   )
 }
}
export default injectIntl(LayerListRedux);
