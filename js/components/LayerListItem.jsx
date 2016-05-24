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
import FilterModal from './FilterModal.jsx';
import LabelModal from './LabelModal.jsx';
import StyleModal from './StyleModal.jsx';
import LayerActions from '../actions/LayerActions.js';
import Slider from 'material-ui/lib/slider';
import Checkbox from 'material-ui/lib/checkbox';
import ListItem from 'material-ui/lib/lists/list-item';
import RadioButton from 'material-ui/lib/radio-button';
import IconButton from 'material-ui/lib/icon-button';
import DownloadIcon from 'material-ui/lib/svg-icons/file/file-download';
import ZoomInIcon from 'material-ui/lib/svg-icons/action/zoom-in';
import FilterIcon from 'material-ui/lib/svg-icons/content/filter-list';
import LabelIcon from 'material-ui/lib/svg-icons/content/text-format';
import StyleIcon from 'material-ui/lib/svg-icons/image/brush';
import MoveUpIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up';
import MoveDownIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down';
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete';
import EditIcon from 'material-ui/lib/svg-icons/editor/mode-edit';
import {injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './LayerListItem.css';

/**
 * An item in the LayerList component.
 */
@pureRender
class LayerListItem extends React.Component {
  constructor(props) {
    super(props);
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
    props.layer.on('change:visible', function(evt) {
      this.setState({checked: evt.target.getVisible()});
    }, this);
    this.state = {
      checked: props.layer.getVisible()
    };
  }
  _handleChange(event) {
    var visible = event.target.checked;
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
      for (var i = 0, ii = baseLayers.length; i < ii; ++i) {
        baseLayers[i].setVisible(false);
      }
      this.props.layer.setVisible(true);
    } else {
      this.props.layer.setVisible(visible);
    }
    this.setState({checked: visible});
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
    this.refs.stylemodal.getWrappedInstance().open();
  }
  _onCloseModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose.call();
    }
    this.refs.filtermodal.getWrappedInstance().close();
  }
  _zoomTo() {
    var map = this.props.map;
    var extent = this.props.layer.get('EX_GeographicBoundingBox');
    if (!extent) {
      extent = this.props.layer.getSource().getExtent();
    }
    map.getView().fit(
      extent,
      map.getSize()
    );
  }
  _moveUp() {
    LayerActions.moveLayerUp(this.props.layer);
  }
  _moveDown() {
    LayerActions.moveLayerDown(this.props.layer);
  }
  _remove() {
    LayerActions.removeLayer(this.props.layer);
  }
  _edit() {
    LayerActions.editLayer(this.props.layer);
  }
  _changeOpacity(evt, value) {
    this.props.layer.setOpacity(value);
  }
  render() {
    const layer = this.props.layer;
    const source = layer.getSource ? layer.getSource() : undefined;
    var opacity;
    if (this.props.showOpacity && source && layer.get('type') !== 'base') {
      var val = layer.getOpacity();
      opacity = (<Slider style={{width: '200px'}} defaultValue={val} onChange={this._changeOpacity.bind(this)} />);
    }
    var zoomTo;
    // TODO add titles back for icon buttons
    if (layer.get('type') !== 'base' && layer.get('type') !== 'base-group' && ((source && source.getExtent) || layer.get('EX_GeographicBoundingBox')) && this.props.showZoomTo) {
      zoomTo = <IconButton onTouchTap={this._zoomTo.bind(this)}><ZoomInIcon /></IconButton>;
    }
    var download;
    if (layer instanceof ol.layer.Vector && this.props.showDownload) {
      download = (<IconButton onTouchTap={this._download.bind(this)}><DownloadIcon /></IconButton>);
    }
    var filter;
    if (layer instanceof ol.layer.Vector && this.props.allowFiltering) {
      filter = (<IconButton onTouchTap={this._filter.bind(this)}><FilterIcon /></IconButton>);
    }
    var label;
    if (layer instanceof ol.layer.Vector && this.props.allowLabeling) {
      label = (<IconButton onTouchTap={this._label.bind(this)}><LabelIcon /></IconButton>);
    }
    var styling;
    var canStyle = layer.get('wfsInfo') && this.props.allowStyling;
    if (canStyle) {
      styling = (<IconButton onTouchTap={this._style.bind(this)}><StyleIcon /></IconButton>);
    }
    var reorderUp, reorderDown;
    if (layer.get('type') !== 'base' && this.props.allowReordering && !this.props.nestedItems) {
      reorderUp = (<IconButton onTouchTap={this._moveUp.bind(this)}><MoveUpIcon /></IconButton>);
      reorderDown = (<IconButton onTouchTap={this._moveDown.bind(this)}><MoveDownIcon /></IconButton>);
    }
    var remove;
    if (layer.get('isRemovable') === true) {
      remove = (<IconButton onTouchTap={this._remove.bind(this)}><DeleteIcon /></IconButton>);
    }
    var edit;
    if (this.props.allowEditing && layer.get('isWFST') === true) {
      edit = (<IconButton onTouchTap={this._edit.bind(this)}><EditIcon /></IconButton>);
    }
    var input;
    if (layer.get('type') === 'base') {
      input = (<RadioButton checked={this.state.checked} label={this.props.title} value={this.props.title} onCheck={this._handleChange.bind(this)} />);
    } else {
      input = (<Checkbox checked={this.state.checked} label={this.props.title} onCheck={this._handleChange.bind(this)} />);
    }
    var labelModal, filterModal, styleModal;
    if (this.props.layer instanceof ol.layer.Vector) {
      labelModal = (<LabelModal {...this.props} layer={this.props.layer} ref='labelmodal' />);
      filterModal = (<FilterModal {...this.props} layer={this.props.layer} onHide={this._onCloseModal.bind(this)} ref='filtermodal' />);
    }
    if (canStyle) {
      styleModal = (<StyleModal {...this.props} layer={this.props.layer} ref='stylemodal' />);
    }
    return (
      <ListItem className='sdk-component layer-list-item' autoGenerateNestedIndicator={false} secondaryText={this.props.layer.get('name')} primaryText={input ? undefined : this.props.title} nestedItems={this.props.nestedItems} initiallyOpen={true}>
        {input}
        {opacity}
        {zoomTo}
        {download}
        {filter}
        {label}
        {styling}
        {reorderUp}
        {reorderDown}
        {remove}
        {edit}
        <span>
          {filterModal}
          {labelModal}
          {styleModal}
        </span>
      </ListItem>
    );
  }
}

LayerListItem.propTypes = {
  /**
   * The map in which the layer of this item resides.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The layer associated with this item.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * The feature format to serialize in for downloads.
   */
  downloadFormat: React.PropTypes.oneOf(['GeoJSON', 'KML', 'GPX']),
  /**
   * The title to show for the layer.
   */
  title: React.PropTypes.string.isRequired,
  /**
   * Should we show a zoom to button for the layer?
   */
  showZoomTo: React.PropTypes.bool,
  /**
   * Should we show up and down buttons to allow reordering?
   */
  allowReordering: React.PropTypes.bool,
  /**
   * Should we allow for filtering of features in a layer?
   */
  allowFiltering: React.PropTypes.bool,
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
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(LayerListItem);
