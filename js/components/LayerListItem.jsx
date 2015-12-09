import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import LayerActions from '../actions/LayerActions.js';
import Dialog from 'pui-react-modals';
import Grids from 'pui-react-grids';
import UI from 'pui-react-buttons';
import filtrex from 'filtrex';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './LayerListItem.css';

const messages = defineMessages({
  opacitylabel: {
    id: 'layerlistitem.opacitylabel',
    description: 'Label for opacity inputs, only used for screen readers',
    defaultMessage: 'Layer opacity'
  },
  baselayergrouplabel: {
    id: 'layerlistitem.baselayergrouplabel',
    description: 'Label for base layer group radio input, only used for screen readers',
    defaultMessage: 'Select base layer'
  },
  layervisibilitylabel: {
    id: 'layerlistitem.layervisibilitylabel',
    description: 'Label for layer visibility checkbox, only used for screen readers',
    defaultMessage: 'Layer visibility'
  },
  filtermodalinputlabel: {
    id: 'layerlistitem.filtermodalinputlabel',
    description: 'Label for filter input in modal dialog, only used for screen readers',
    defaultMessage: 'Text to filter features in layer by'
  },
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
  filtertitle: {
    id: 'layerlistitem.filtertitle',
    description: 'Title for the filter button',
    defaultMessage: 'Filter layer'
  },
  filtermodaltitle: {
    id: 'layerlistitem.filtermodaltitle',
    description: 'Title for the filter button',
    defaultMessage: 'Filters for layer {layer}'
  },
  addfiltertext: {
    id: 'layerlistitem.addfiltertext',
    description: 'Title for the add filter button',
    defaultMessage: 'Add'
  },
  removefiltertext: {
    id: 'layerlistitem.removefiltertext',
    description: 'Title for the remove filter button',
    defaultMessage: 'Remove'
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
@pureRender
class LayerListItem extends React.Component {
  constructor(props) {
    super(props);
    props.layer.on('change:visible', function(evt) {
      this.setState({checked: evt.target.getVisible()});
    }, this);
    this.state = {
      hasError: false,
      filters: [],
      checked: props.layer.getVisible()
    };
  }
  componentDidMount() {
    this._setStyleFunction();
  }
  _setStyleFunction() {
    var layer = this.props.layer;
    if (this.props.allowFiltering && layer instanceof ol.layer.Vector) {
      var cluster = layer.getSource() instanceof ol.source.Cluster;
      var style = layer.getStyle();
      var me = this;
      layer.setStyle(function(feature, resolution) {
        var hide = false;
        if (!cluster) {
          for (var i = 0, ii = me.state.filters.length; i < ii; i++){
            if (!me.state.filters[i].filter(feature.getProperties())){
              hide = true;
              continue;
            }
          }
        }
        if (hide) {
          return undefined;
        } else {
          if (style instanceof ol.style.Style) {
            return [style];
          } else if (Array.isArray(style)) {
            return style;
          } else {
            return style.call(this, feature, resolution);
          }
        }
      });
    }
  }
  _onSubmit(evt) {
    evt.preventDefault();
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
    var layer = this.props.layer;
    var geojson = new ol.format.GeoJSON();
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      source = source.getSource();
    }
    var features = source.getFeatures();
    var json = geojson.writeFeatures(features);
    var dl = document.createElement('a');
    dl.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
    dl.setAttribute('download', layer.get('title') + '.geojson');
    dl.click();
  }
  _removeFilter(filter) {
    var layer = this.props.layer;
    var filters = this.state.filters;
    for (var i = 0, ii = filters.length; i < ii; i++){
      if (filters[i] === filter){
        filters.splice(i, 1);
        break;
      }
    }
    this.setState({filters: filters});
    if (layer.getSource() instanceof ol.source.Cluster) {
      this._updateCluster();
    }
    layer.getSource().changed();
  }
  _updateCluster() {
    var layer = this.props.layer;
    var features = layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var subFeatures = features[i].get('features');
      for (var j = 0, jj = subFeatures.length; j < jj; ++j) {
        var hide = false;
        for (var f = 0, ff = this.state.filters.length; f < ff; f++){
          if (!this.state.filters[f].filter(subFeatures[j].getProperties())) {
            hide = true;
            continue;
          }
        }
        // do not use an observable property, we do not want to notify
        subFeatures[j].hide = hide;
      }
    }
  }
  _addFilter() {
    var layer = this.props.layer;
    var filters = this.state.filters;
    var filter;
    var expression = ReactDOM.findDOMNode(this.refs.filterTextBox).value;
    try {
      filter = filtrex(expression);
    } catch (e) {
      this.setState({hasError: true});
      return;
    }
    var exists = false;
    for (var i = 0, ii = filters.length; i < ii; ++i) {
      if (filters[i].title === expression) {
        exists = true;
        break;
      }
    }
    if (exists === false) {
      filters.push({title: expression, filter: filter});
      this.setState({
        filters: filters,
        hasError: false
      });
      if (layer.getSource() instanceof ol.source.Cluster) {
        this._updateCluster();
      }
      layer.getSource().changed();
    }
  }
  _filter() {
    if (this.props.onModalOpen) {
      this.props.onModalOpen.call();
    }
    this.refs.filtermodal.open();
  }
  _onCloseModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose.call();
    }
    this.refs.filtermodal.close();
  }
  _zoomTo() {
    var map = this.props.map;
    map.getView().fit(
      this.props.layer.getSource().getExtent(),
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
  _changeOpacity(event) {
    this.props.layer.setOpacity(parseFloat(event.target.value));
  }
  render() {
    const {formatMessage} = this.props.intl;
    var inputClassName = 'form-control';
    if (this.state.hasError) {
      inputClassName += ' input-has-error';
    }
    const layer = this.props.layer;
    const source = layer.getSource ? layer.getSource() : undefined;
    var opacity;
    if (this.props.showOpacity && source && layer.get('type') !== 'base') {
      var val = layer.getOpacity();
      var opacityInputId = 'layerlistitem-' + layer.get('id') + '-opacity';
      opacity = (
        <ul><div className='input-group'>
          <label className='sr-only' htmlFor={opacityInputId}>{formatMessage(messages.opacitylabel)}</label>
          <input id={opacityInputId} onChange={this._changeOpacity.bind(this)} defaultValue={val} type="range" name="opacity" min="0" max="1" step="0.01" />
        </div></ul>
      );
    }
    var zoomTo;
    if (layer.get('type') !== 'base' && layer.get('type') !== 'base-group' && (source && source.getExtent) && this.props.showZoomTo) {
      zoomTo = <a title={formatMessage(messages.zoomtotitle)} href='#' onClick={this._zoomTo.bind(this)}><i className='layer-zoom-to glyphicon glyphicon-zoom-in'></i></a>;
    }
    var download;
    if (layer instanceof ol.layer.Vector && this.props.showDownload) {
      download = <a title={formatMessage(messages.downloadtitle)} href='#' onClick={this._download.bind(this)}><i className='layer-download glyphicon glyphicon-download-alt'></i></a>;
    }
    var filter;
    if (layer instanceof ol.layer.Vector && this.props.allowFiltering) {
      filter = <a title={formatMessage(messages.filtertitle)} href='#' onClick={this._filter.bind(this)}><i className='layer-set-filters glyphicon glyphicon-filter'></i></a>;
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
      var baselayerId = 'layerlistitem-' + layer.get('id') + '-baselayergroup';
      if (this.state.checked) {
        input = (<div className='input-group'><label className='sr-only' htmlFor={baselayerId}>{formatMessage(messages.baselayergrouplabel)}</label><input id={baselayerId} type="radio" name="baselayergroup" value={this.props.title} checked onChange={this._handleChange.bind(this)} />{this.props.title}</div>);
      } else {
        input = (<div className='input-group'><label className='sr-only' htmlFor={baselayerId}>{formatMessage(messages.baselayergrouplabel)}</label><input id={baselayerId} type="radio" name="baselayergroup" value={this.props.title} onChange={this._handleChange.bind(this)} />{this.props.title}</div>);
      }
    } else if (layer.get('type') === 'base-group'){
      var baselayerId = 'layerlistitem-' + layer.get('id') + '-baselayergroup';
      var heading = (<h4><strong>Base maps</strong></h4>);
    } else {
      var inputId = 'layerlistitem-' + layer.get('id') + '-visibility';
      input = (<ul><div className='input-group'><label className='sr-only' htmlFor={inputId}>{formatMessage(messages.layervisibilitylabel)}</label><input id={inputId} type="checkbox" checked={this.state.checked} onChange={this._handleChange.bind(this)} />{this.props.title}</div></ul>);
    }
    var filters = this.state.filters.map(function(f) {
      var filterName = f.title.replace(/\W+/g, '');
      return (
        <div key={filterName} className='form-group' ref={filterName}>
          <Grids.Col md={20}>
            <label>{f.title}</label>
          </Grids.Col>
          <Grids.Col md={4}>
            <UI.DefaultButton onClick={this._removeFilter.bind(this, f)}>{formatMessage(messages.removefiltertext)}</UI.DefaultButton>
          </Grids.Col>
        </div>
      );
    }, this);
    return (
      <li>
        {heading}
        {input}
        {opacity}
        <ul>{zoomTo}
        {download}
        {filter}
        {reorderUp}
        {reorderDown}
        {remove}</ul>
        {this.props.children}
        <span>
          <Dialog.Modal onHide={this._onCloseModal.bind(this)} title={formatMessage(messages.filtermodaltitle, {layer: this.props.layer.get('title')})} ref="filtermodal">
            <Dialog.ModalBody>
              <form onSubmit={this._onSubmit} className='form-horizontal layerlistitem'>
                <div className="form-group">
                  <Grids.Col md={20}>
                    <label htmlFor='layerlistitem-filtertext' className='sr-only'>{formatMessage(messages.filtermodalinputlabel)}</label>
                    <input id='layerlistitem-filtertext' ref='filterTextBox' type='text' className={inputClassName}/>
                  </Grids.Col>
                  <Grids.Col md={4}>
                    <UI.DefaultButton onClick={this._addFilter.bind(this)}>{formatMessage(messages.addfiltertext)}</UI.DefaultButton>
                  </Grids.Col>
                </div>
                {filters}
              </form>
            </Dialog.ModalBody>
            <Dialog.ModalFooter>
            </Dialog.ModalFooter>
          </Dialog.Modal>
        </span>
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
   * Should we allow for filtering of features in a layer?
   */
  allowFiltering: React.PropTypes.bool,
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
