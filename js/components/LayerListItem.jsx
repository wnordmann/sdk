/* global ol */
import React from 'react';
import LayerActions from '../actions/LayerActions.js';

export default class LayerListItem extends React.Component {
  constructor(props) {
    super(props);
    props.layer.on('change:visible', function(evt) {
      this.setState({checked: evt.target.getVisible()});
    }, this);
    this.state = {
      checked: props.layer.getVisible()
    };
  }
  _handleChange() {
    var visible = event.target.checked;
    LayerActions.setVisible(this.props.layer, visible);
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
  _changeOpacity(event) {
    LayerActions.setOpacity(this.props.layer, parseFloat(event.target.value));
  }
  render() {
    var opacity;
    if (this.props.showOpacity) {
      var val = this.props.layer.getOpacity();
      opacity = <input onChange={this._changeOpacity.bind(this)} defaultValue={val} type="range" name="opacity" min="0" max="1" step="0.01"></input>;
    }
    var zoomTo;
    if (this.props.layer.get('type') !== 'base' && this.props.showZoomTo) {
      zoomTo = <a title='Zoom to layer' href='#' onClick={this._zoomTo.bind(this)}><i className='layer-zoom-to glyphicon glyphicon-zoom-in'></i></a>;
    }
    var download;
    if (this.props.layer instanceof ol.layer.Vector && this.props.showDownload) {
      download = <a title='Download layer' href='#' onClick={this._download.bind(this)}><i className='layer-download glyphicon glyphicon-download-alt'></i></a>;
    }
    var reorderUp, reorderDown;
    if (this.props.layer.get('type') !== 'base' && this.props.allowReordering && !this.props.children) {
      reorderUp = <a title='Move up' href='#' onClick={this._moveUp.bind(this)}><i className='layer-move-up glyphicon glyphicon-triangle-top'></i></a>;
      reorderDown = <a title='Move down' href='#' onClick={this._moveDown.bind(this)}><i className='layer-move-down glyphicon glyphicon-triangle-bottom'></i></a>;
    }
    return (
      <li>
        <input type="checkbox" checked={this.state.checked} onChange={this._handleChange.bind(this)}/>{this.props.title}
        {opacity}
        {zoomTo}
        {download}
        {reorderUp}
        {reorderDown}
        {this.props.children}
      </li>
    );
  }
}

LayerListItem.propTypes = {
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  title: React.PropTypes.string.isRequired,
  showZoomTo: React.PropTypes.bool,
  allowReordering: React.PropTypes.bool,
  showDownload: React.PropTypes.bool,
  children: React.PropTypes.element,
  showOpacity: React.PropTypes.bool
};

LayerListItem.defaultProps = {
  showZoomTo: false,
  allowReordering: false,
  showDownload: false,
  showOpacity: false
};
