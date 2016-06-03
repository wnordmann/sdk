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
import classNames from 'classnames';
import LayerIdService from '../services/LayerIdService.js';
import LayerStore from '../stores/LayerStore.js';
import LayerListItem from './LayerListItem.jsx';
import Label from './Label.jsx';
import AddLayerModal from './AddLayerModal.jsx';
import RaisedButton from 'material-ui/lib/raised-button';
import IconButton from 'material-ui/lib/icon-button';
import NoteAdd from 'material-ui/lib/svg-icons/action/note-add';
import List from 'material-ui/lib/lists/list';
import LayersIcon from 'material-ui/lib/svg-icons/maps/layers';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
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
    defaultMessage: ' Add Layer '
  }
});

/**
 * A list of layers in the map. Allows setting visibility and opacity.
 *
 * ```html
 * <div id='layerlist'>
 *   <LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} />
 * </div>
 * ```
 */
@pureRender
class LayerList extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {};
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
    if (this.props.showOnStart) {
      this._showPanel();
    }
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  _onChange() {
    this.setState(LayerStore.getState());
  }
  renderLayerGroup(group) {
    return this.renderLayers(group.getLayers().getArray().slice(0).reverse(), group);
  }
  renderLayers(layers, group) {
    var me = this;
    var layerNodes = layers.map(function(lyr) {
      return me.getLayerNode(lyr, group);
    });
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
    while (node != null) {
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
  getLayerNode(lyr, group) {
    if (lyr.get('id') === undefined) {
      lyr.set('id', LayerIdService.generateId());
    }
    if (lyr.get('title') !== null) {
      if (lyr instanceof ol.layer.Group) {
        var children = this.props.showGroupContent ? this.renderLayerGroup(lyr) : [];
        return (
          <LayerListItem {...this.props} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} nestedItems={children} title={lyr.get('title')} disableTouchRipple={true}/>
        );
      } else {
        return (
          <LayerListItem {...this.props} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} group={group} title={lyr.get('title')} disableTouchRipple={true}/>
        );
      }
    }
  }
  _showAddLayer() {
    this.refs.addlayermodal.getWrappedInstance().open();
  }
  render() {
    const {formatMessage} = this.props.intl;
    var layers = this.state.layers.slice(0).reverse();
    var divClass = {
      'layer-switcher': true,
      'shown': this.state.visible,
      'sdk-component': true,
      'layer-list': true
    };
    var tipLabel = this.props.tipLabel ? (<div className='layer-list-header'><Label>this.props.tipLabel</Label></div>) : undefined;
    var addLayer;
    if (this.props.addLayer) {
      addLayer = (
          <article className="layer-list-add">
          <Toolbar><ToolbarGroup firstChild={true} float="right"><RaisedButton icon={<NoteAdd />} label={formatMessage(messages.addlayertext)} onTouchTap={this._showAddLayer.bind(this)} disableTouchRipple={true}/></ToolbarGroup></Toolbar>
          <AddLayerModal srsName={this.props.map.getView().getProjection().getCode()} allowUserInput={this.props.addLayer.allowUserInput} asVector={this.props.addLayer.asVector} map={this.props.map} url={this.props.addLayer.url} ref='addlayermodal'/>
          </article>
      );
    }
    var onMouseOut = this.props.expandOnHover ? this._hidePanel.bind(this) : undefined;
    var onMouseOver = this.props.expandOnHover ? this._showPanel.bind(this) : undefined;
    var onClick = !this.props.expandOnHover ? this._togglePanel.bind(this) : undefined;
    return (
      <div ref='parent' onMouseOut={onMouseOut} onMouseOver={onMouseOver} className={classNames(divClass, this.props.className)}>
        <IconButton style={this.props.style} className='layerlistbutton' tooltip={formatMessage(messages.layertitle)} onTouchTap={onClick}><LayersIcon color='white' /></IconButton>
        <div className='layer-tree-panel clearfix'>
          {tipLabel}
          <List className='layer-list-list'>
            {this.renderLayers(layers)}
          </List>
          {addLayer}
        </div>
      </div>
    );
  }
}

LayerList.propTypes = {
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
   * Should we show the contents of layer groups?
   */
  showGroupContent: React.PropTypes.bool,
  /**
   * Should we show a download button for layers?
   */
  showDownload: React.PropTypes.bool,
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
   * Should we expand when hovering over the layers button?
   */
  expandOnHover: React.PropTypes.bool,
  /**
   * Should we show this component on start of the application?
   */
  showOnStart: React.PropTypes.bool,
  /**
   * Should we allow adding layers through WMS or WFS GetCapabilities?
   * Object with keys url (string, required), allowUserInput (boolean, optional) and asVector (boolean, optional).
   * If asVector is true, layers will be retrieved from WFS and added as vector.
   * If allowUserInput is true, the user will be able to provide a url through an input.
   */
  addLayer: React.PropTypes.shape({
    url: React.PropTypes.string.isRequired,
    allowUserInput: React.PropTypes.bool,
    asVector: React.PropTypes.bool
  }),
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

LayerList.defaultProps = {
  showZoomTo: false,
  allowReordering: false,
  allowEditing: false,
  allowFiltering: false,
  allowLabeling: false,
  allowStyling: false,
  showGroupContent: true,
  showDownload: false,
  downloadFormat: 'GeoJSON',
  showOpacity: false,
  expandOnHover: true,
  showOnStart: false,
  style: {
    background: 'rgba(0,60,136,.7)',
    borderRadius: '2px',
    width: '28px',
    height: '28px',
    padding: '2px'
  }
};

export default injectIntl(LayerList);
