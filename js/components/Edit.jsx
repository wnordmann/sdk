/* global ol */
/* eslint react/prop-types: 0 */
import React from 'react';
import MapTool from './MapTool.js';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Dialog from 'pui-react-modals';
import Grids from 'pui-react-grids';
import ColorPicker from 'react-color-picker';
import Pui from 'pui-react-alerts';
import '../../node_modules/react-color-picker/index.css';
import './Edit.css';

const NEW_ATTR_PREFIX = 'new-attr-';
const ID_PREFIX = 'sdk-edit-';

export default class Edit extends MapTool {
  constructor(props) {
    super(props);
    this._interactions = {};
    this.state = {
      layers: [],
      enable: true,
      error: false,
      attributes: null
    };
    this._strokeColor = '#452135';
    this._fillColor = '#452135';
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _onChangeStroke(color) {
    this._strokeColor = color;
  }
  _onChangeFill(color) {
    this._fillColor = color;
  }
  _generateId() {
    return ID_PREFIX + this.state.layers.length;
  }
  _createLayer() {
    var layerName = React.findDOMNode(this.refs.layerName).value;
    var geometryType = React.findDOMNode(this.refs.geometryType).value;
    var attributes = React.findDOMNode(this.refs.attributes).value;
    if (layerName !== '') {
      var fill = this._fillColor ? new ol.style.Fill({color: this._fillColor}) : undefined;
      var stroke = this._strokeColor ? new ol.style.Stroke({color: this._strokeColor, width: this.props.strokeWidth}) : undefined;
      var style = new ol.style.Style({
        fill: fill,
        stroke: stroke,
        image: (fill || stroke) ? new ol.style.Circle({stroke: stroke, fill: fill, radius: this.props.pointRadius}) : undefined
      });
      var layer = new ol.layer.Vector({
        title: layerName,
        id: this._generateId(),
        geomType: geometryType,
        schema: attributes,
        isSelectable: true,
        isRemovable: true,
        style: style,
        source: new ol.source.Vector({useSpatialIndex: false})
      });
      this.props.map.addLayer(layer);
      var layers = this.state.layers;
      layers.push(layer);
      this.refs.modal.close();
      this.setState({layers: layers});
    }
  }
  _disableEditMode() {
    this.setState({enable: true});
    this.deactivate();
  }
  _onLayerChange() {
    this._activate();
  }
  _enableEditMode() {
    if (this.state.layers.length === 0) {
      this.setState({error: true});
    } else {
      this.setState({error: false, enable: false});
      this._activate();
    }
  }
  _addFeatureDialog(feature, attributes) {
    this._feature = feature;
    this.setState({
      attributes: attributes
    });
    this.refs.attributesModal.open();
  }
  _setAttributes() {
    var feature = this._feature;
    for (var i = 0, ii = this.state.attributes.length; i < ii; ++i) {
      var name = this.state.attributes[i];
      var value = React.findDOMNode(this.refs[NEW_ATTR_PREFIX + name]).value;
      feature.set(name, value);
    }
    this.refs.attributesModal.close();
  }
  _activate() {
    var layerId = React.findDOMNode(this.refs.layer).value;
    var layer;
    for (var i = 0, ii = this.state.layers.length; i < ii; ++i) {
      if (this.state.layers[i].get('id') === layerId) {
        layer = this.state.layers[i];
        break;
      }
    }
    var featColl = layer.getSource().getFeaturesCollection();
    if (!this._interactions[layerId]) {
      this._interactions[layerId] = {
        draw: new ol.interaction.Draw({
          features: featColl,
          type: layer.get('geomType')
        }),
        modify: new ol.interaction.Modify({
          features: featColl,
          deleteCondition: function(event) {
            return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
          }
        })
      };
      var schema = layer.get('schema').trim();
      if (schema.length > 0) {
        this._interactions[layerId].draw.on('drawend', function(evt){
          this._addFeatureDialog(evt.feature, schema.split(','));
        }, this);
      }
    }
    var draw = this._interactions[layerId].draw;
    var modify = this._interactions[layerId].modify;
    this.deactivate();
    this.activate([draw, modify]);
  }
  _showModal() {
    this.refs.modal.open();
  }
  render() {
    var options = [], i, ii;
    for (i = 0, ii = this.state.layers.length; i < ii; ++i) {
      var lyr = this.state.layers[i], title = lyr.get('title'), id = lyr.get('id');
      options.push(<option key={id} value={id}>{title}</option>);
    }
    if (options.length === 0) {
      var val = '[None]';
      options.push(<option key={val} value={val}>{val}</option>);
    }
    var button;
    if (this.state.enable === true) {
      button = (<UI.DefaultButton onClick={this._enableEditMode.bind(this)}>Enable edit mode</UI.DefaultButton>);
    } else {
      button = (<UI.DefaultButton onClick={this._disableEditMode.bind(this)}>Disable edit mode</UI.DefaultButton>);
    }
    var attributeFormItems;
    if (this.state.attributes !== null) {
      attributeFormItems = [];
      for (i = 0, ii = this.state.attributes.length; i < ii; ++i) {
        var name = this.state.attributes[i], ref = NEW_ATTR_PREFIX + name;
        attributeFormItems.push(<div key={ref} className="form-group"><Grids.Col md={12}><label>{name}</label></Grids.Col><Grids.Col md={8}><input className="form-control" type='text' ref={ref} /></Grids.Col></div>);
      }
    }
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={true} withIcon={true}>No editable layer is available. Create one to start editing.</Pui.ErrorAlert></div>);
    }
    return (
      <article>
        <form onSubmit={this._onSubmit} className='form-inline'>
          <label>Layer:</label>
          <select onChange={this._onLayerChange.bind(this)} ref='layer' className='form-control'>{options}</select>
          <UI.DefaultButton onClick={this._showModal.bind(this)}><Icon.Icon name='plus' /></UI.DefaultButton>
          {button}
          {error}
        </form>
        <Dialog.Modal title="New feature attributes" ref="attributesModal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              {attributeFormItems}
            </form>
          </Dialog.ModalBody>
         <Dialog.ModalFooter>
             <UI.DefaultButton title="Set feature attributes" onClick={this._setAttributes.bind(this)}>Ok</UI.DefaultButton>
           </Dialog.ModalFooter>
        </Dialog.Modal>
        <Dialog.Modal title="Create empty layer" ref="modal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              <div className="form-group">
                <Grids.Col md={12}><label>Layer name</label></Grids.Col>
                <Grids.Col md={8}><input className="form-control" type="text" ref="layerName"/></Grids.Col>
              </div>
              <div className="form-group">
                <Grids.Col md={12}><label>Geometry type</label></Grids.Col>
                <Grids.Col md={8}>
                  <select className='form-control' ref='geometryType'>
                    <option>Point</option>
                    <option>LineString</option>
                    <option>Polygon</option>
                  </select>
                </Grids.Col>
              </div>
              <div className="form-group">
                <Grids.Col md={12}><label>Attributes (comma-separated names)</label></Grids.Col>
                <Grids.Col md={8}><input className="form-control" type="text" ref="attributes"/></Grids.Col>
              </div>
              <div className="form-group">
                 <Grids.Col md={12}><label>Stroke color</label></Grids.Col>
                 <Grids.Col md={8}><ColorPicker onChange={this._onChangeStroke.bind(this)} saturationWidth={100} ref='strokeColor' saturationHeight={75} defaultValue={this._strokeColor} /></Grids.Col>
             </div>
             <div className="form-group">
               <Grids.Col md={12}><label>Fill color</label></Grids.Col>
               <Grids.Col md={8}><ColorPicker onChange={this._onChangeFill.bind(this)} saturationWidth={100} ref='fillColor' saturationHeight={75} defaultValue={this._fillColor} /></Grids.Col>
             </div>
           </form>
         </Dialog.ModalBody>
         <Dialog.ModalFooter>
           <UI.DefaultButton title="Create empty layer" onClick={this._createLayer.bind(this)}>Create</UI.DefaultButton>
         </Dialog.ModalFooter>
       </Dialog.Modal>
      </article>
    );
  }
}

Edit.propTypes = {
  strokeWidth: React.PropTypes.number,
  pointRadius: React.PropTypes.number
};

Edit.defaultProps = {
  strokeWidth: 2,
  pointRadius: 7
};
