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
import debounce from  'debounce';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import ol from 'openlayers';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import LayerListItem from './LayerListItem';
import Label from './Label';
import AddLayerModal from './AddLayerModal';
import BaseMapModal from './BaseMapModal';
import RaisedButton from 'material-ui/RaisedButton';
import Button from './Button';
import NoteAdd from 'material-ui/svg-icons/action/note-add';
import {List} from 'material-ui/List';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import BaseMapIcon from 'material-ui/svg-icons/maps/satellite';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Paper from 'material-ui/Paper';
import {findLayerById} from '../state/layers/reducers';
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
 * A list of layers in the map. Allows setting visibility and opacity.
 *
 * ```xml
 * <LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} />
 * ```
 *
 * ![Layer List](../LayerList.png)
 */
class LayerList extends React.Component {
  static propTypes = {
    /**
     * Layers to render.
     */
    layers: React.PropTypes.array,
    /**
     * Remove layer callback. Gets map, layer and group arguments.
     */
    onLayerRemove: React.PropTypes.func,
    /**
     * Move layer callback.
     */
    onLayerMove: React.PropTypes.func,
    /**
     * The map whose layers should show up in this layer list.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Style for the button.
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
     * Should we show the contents of layer groups?
     */
    showGroupContent: React.PropTypes.bool,
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
     * Should we allow adding base maps from a selector modal?
     */
    addBaseMap: React.PropTypes.shape({
      tileServices: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        endpoint: React.PropTypes.string,
        standard: React.PropTypes.string.isRequired,
        attribution: React.PropTypes.string,
        thumbnail: React.PropTypes.string.isRequired
      }))
    }),
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
    showGroupContent: true,
    showDownload: false,
    downloadFormat: 'GeoJSON',
    includeLegend: false,
    showOpacity: false,
    showOnStart: false,
    collapsible: true
  };

  constructor(props, context) {
    super(props);
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme()
    };
    this.moveLayer = debounce(this.moveLayer, 100);
  }
  componentWillMount() {
    if (this.props.showOnStart) {
      this._showPanel();
    }
  }
  renderLayerGroup(group) {
    return this.renderLayers(group.children, findLayerById(group.id));
  }
  renderLayers(layers, group) {
    var me = this;
    var layerNodes = [];
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      if (!this.props.filter || this.props.filter(findLayerById(layers[i].id)) === true) {
        layerNodes.push(me.getLayerNode(layers[i], group, (ii - i) - 1));
      }
    }
    return layerNodes;
  }
  _showPanel(evt) {
    if (!this.state.visible) {
      this.setState({visible: true});
    }
  }
  _isDescendant(el) {
    var parent = ReactDOM.findDOMNode(this.refs.parent);
    var node = el;
    while (node !== null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }
  _hidePanel(evt) {
    if (this._modalOpen !== true && !this._isDescendant(evt.relatedTarget)) {
      this.setState({visible: false});
    }
  }
  _togglePanel() {
    var newVisible = !this.state.visible;
    if (newVisible || this._modalOpen !== true) {
      this.setState({visible: newVisible});
    }
  }
  _onModalOpen() {
    this._modalOpen = true;
  }
  _onModalClose() {
    this._modalOpen = false;
  }
  getLayerNode(layer, group, idx) {
    var lyr = findLayerById(layer.id);
    if (this.props.addBaseMap && lyr.get('type') === 'base' && !lyr.getVisible()) {
      return undefined;
    }
    if (lyr.get('title') !== null) {
      if (lyr instanceof ol.layer.Group) {
        var children = this.props.showGroupContent ? this.renderLayerGroup(layer) : [];
        return (
          <LayerListItem index={idx} onLayerRemove={this.props.onLayerRemove} moveLayer={this.moveLayer.bind(this)} {...this.props} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} group={group} nestedItems={children} title={lyr.get('title')} disableTouchRipple={true}/>
        );
      } else {
        return (
          <LayerListItem index={idx} onLayerRemove={this.props.onLayerRemove} moveLayer={this.moveLayer.bind(this)} {...this.props} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} group={group} title={lyr.get('title')} disableTouchRipple={true}/>
        );
      }
    }
  }
  _showAddLayer() {
    this.refs.addlayermodal.getWrappedInstance().open();
  }
  _showAddBaseMap() {
    this.refs.addbasemapmodal.getWrappedInstance().open();
  }
  moveLayer(dragIndex, hoverIndex, layer, group) {
    this.props.onLayerMove(this.props.map, hoverIndex, layer, group);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var layers = this.props.layers;
    var divClass = {
      'layer-switcher': true,
      'shown': this.state.visible,
      'sdk-component': true,
      'layer-list': true
    };
    var tipLabel = this.props.tipLabel ? (<div className='layer-list-header'><Label>{this.props.tipLabel}</Label></div>) : undefined;
    var addLayer;
    if (this.props.addLayer || this.props.addBaseMap) {
      var layerAdd, baseAdd, layerModal, baseModal;
      if (this.props.addLayer) {
        layerAdd = <RaisedButton icon={<NoteAdd />} label={formatMessage(messages.addlayertext)} onTouchTap={this._showAddLayer.bind(this)} disableTouchRipple={true}/>;
        layerModal = <AddLayerModal srsName={this.props.map.getView().getProjection().getCode()} allowUserInput={this.props.addLayer.allowUserInput} sources={this.props.addLayer.sources} map={this.props.map} ref='addlayermodal'/>;
      }
      if (this.props.addBaseMap) {
        baseAdd = <RaisedButton icon={<BaseMapIcon />} label={formatMessage(messages.addbasemaptext)} onTouchTap={this._showAddBaseMap.bind(this)} disableTouchRipple={true}/>;
        baseModal = <BaseMapModal tileServices={this.props.addBaseMap.tileServices} map={this.props.map} ref='addbasemapmodal' />;
      }
      addLayer = (
          <article className="layer-list-add">
          <Toolbar><ToolbarGroup>
            {layerAdd}
            {baseAdd}
          </ToolbarGroup></Toolbar>
          {layerModal}
          {baseModal}
          </article>
      );
    }
    return (
      <div ref='parent' className={classNames(divClass, this.props.className)}>
        <Button tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} className='layerlistbutton' tooltip={formatMessage(messages.layertitle)} onTouchTap={this._togglePanel.bind(this)}><LayersIcon /></Button>
        <Paper zDepth={0} className='layer-tree-panel'>
          {tipLabel}
          <List className='layer-list-list'>
            {this.renderLayers(layers)}
          </List>
          {addLayer}
        </Paper>
        {this.props.children}
      </div>
    );
  }
}

export default injectIntl(DragDropContext(HTML5Backend)(LayerList));