import React from 'react';
import ol from 'openlayers';
import LayerActions from '../actions/LayerActions.js';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  zoomtotitle: {
    id: 'layerlistitem.zoomtotitle',
    description: 'Title for the zoom to layer button',
    defaultMessage: 'Zoom to layer'
  },
  downloadtitle: {
    id: 'layerlistitem.downloadtitle',
    description: 'Title for the download layer button',
    defaultMessage: 'Download layer'
  },
  movedowntitle: {
    id: 'layerlistitem.movedowntitle',
    description: 'Title for the move layer down button',
    defaultMessage: 'Move down'
  },
  moveuptitle: {
    id: 'layerlistitem.moveuptitle',
    description: 'Title for the move layer up button',
    defaultMessage: 'Move up'
  },
  removetitle: {
    id: 'layerlistitem.removetitle',
    description: 'Title for the remove button',
    defaultMessage: 'Remove'
  }
});

/**
 * An item in the LayerList component.
 */
class LayerListItem extends React.Component {
  constructor(props) {
    super(props);
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
      LayerActions.setBaseLayer(this.props.layer, this.props.map);
    } else {
      LayerActions.setVisible(this.props.layer, visible);
    }
    this.setState({checked: visible});
  }
  _download() {
    LayerActions.downloadLayer(this.props.layer);
  }
  _zoomTo() {
    LayerActions.zoomToLayer(this.props.layer);
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
  _changeOpacity(event) {
    LayerActions.setOpacity(this.props.layer, parseFloat(event.target.value));
  }
  render() {
    const {formatMessage} = this.props.intl;
    var opacity;
    const layer = this.props.layer;
    const source = layer.getSource ? layer.getSource() : undefined;
    if (this.props.showOpacity) {
      var val = layer.getOpacity();
      opacity = <input onChange={this._changeOpacity.bind(this)} defaultValue={val} type="range" name="opacity" min="0" max="1" step="0.01"></input>;
    }
    var zoomTo;
    if (layer.get('type') !== 'base' && layer.get('type') !== 'base-group' && (source && source.getExtent) && this.props.showZoomTo) {
      zoomTo = <a title={formatMessage(messages.zoomtotitle)} href='#' onClick={this._zoomTo.bind(this)}><i className='layer-zoom-to glyphicon glyphicon-zoom-in'></i></a>;
    }
    var download;
    if (layer instanceof ol.layer.Vector && this.props.showDownload) {
      download = <a title={formatMessage(messages.downloadtitle)} href='#' onClick={this._download.bind(this)}><i className='layer-download glyphicon glyphicon-download-alt'></i></a>;
    }
    var reorderUp, reorderDown;
    if (layer.get('type') !== 'base' && this.props.allowReordering && !this.props.children) {
      reorderUp = <a title={formatMessage(messages.moveuptitle)} href='#' onClick={this._moveUp.bind(this)}><i className='layer-move-up glyphicon glyphicon-triangle-top'></i></a>;
      reorderDown = <a title={formatMessage(messages.movedowntitle)} href='#' onClick={this._moveDown.bind(this)}><i className='layer-move-down glyphicon glyphicon-triangle-bottom'></i></a>;
    }
    var remove;
    if (layer.get('isRemovable') === true) {
      remove = <a title={formatMessage(messages.removetitle)} href='#' onClick={this._remove.bind(this)}><i className='layer-remove glyphicon glyphicon-remove'></i></a>;
    }
    var input;
    if (layer.get('type') === 'base') {
      if (this.state.checked) {
        input = (<input type="radio" name="baselayergroup" value={this.props.title} checked onChange={this._handleChange.bind(this)}> {this.props.title}</input>);
      } else {
        input = (<input type="radio" name="baselayergroup" value={this.props.title} onChange={this._handleChange.bind(this)}> {this.props.title}</input>);
      }
    } else {
      input = (<input type="checkbox" checked={this.state.checked} onChange={this._handleChange.bind(this)}> {this.props.title}</input>);
    }
    return (
      <li>
        {input}
        {opacity}
        {zoomTo}
        {download}
        {reorderUp}
        {reorderDown}
        {remove}
        {this.props.children}
      </li>
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
   * Should we show a download button?
   */
  showDownload: React.PropTypes.bool,
  /**
   * The child items to show for this item.
   */
  children: React.PropTypes.element,
  /**
   * Should we show an opacity slider for the layer?
   */
  showOpacity: React.PropTypes.bool,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

LayerListItem.defaultProps = {
  showZoomTo: false,
  allowReordering: false,
  showDownload: false,
  showOpacity: false
};

export default injectIntl(LayerListItem);
