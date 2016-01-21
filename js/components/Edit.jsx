/* eslint react/prop-types: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import MapTool from './MapTool.js';
import UI from 'pui-react-buttons';
import Dialog from 'pui-react-modals';
import Grids from 'pui-react-grids';
import {transformColor} from '../util.js';
import ColorPicker from 'react-color';
import Pui from 'pui-react-alerts';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './Edit.css';

const NEW_ATTR_PREFIX = 'new-attr-';
const ID_PREFIX = 'sdk-edit-';

const messages = defineMessages({
  nolayer: {
    id: 'edit.nolayer',
    description: 'Text to show in the combo box when no layer has been created',
    defaultMessage: 'None'
  },
  enable: {
    id: 'edit.enable',
    description: 'Button text to enable edit mode',
    defaultMessage: 'Enable edit mode'
  },
  newlayer:{
    id: 'edit.newlayer',
    description: 'Button text to create a new layer',
    defaultMessage: 'New layer'
  },
  disable: {
    id: 'edit.disable',
    description: 'Button text to disable edit mode',
    defaultMessage: 'Disable edit mode'
  },
  nolayererror: {
    id: 'edit.nolayererror',
    description: 'Error text for when no layer is available',
    defaultMessage: 'No editable layer is available. Create one to start editing.'
  },
  layerlabel: {
    id: 'edit.layerlabel',
    description: 'Label to show in front of layer combo box',
    defaultMessage: 'Layer'
  },
  newfeaturemodaltitle: {
    id: 'edit.newfeaturemodaltitle',
    description: 'Title for the modal dialog to specify attributes for a new feature',
    defaultMessage: 'New feature attributes'
  },
  okbuttontitle: {
    id: 'edit.okbuttontitle',
    description: 'Title text for Ok button in attributes modal',
    defaultMessage: 'Set feature attributes'
  },
  okbuttontext: {
    id: 'edit.okbuttontext',
    description: 'Text for Ok button in attributes modal',
    defaultMessage: 'Ok'
  },
  createlayermodaltitle: {
    id: 'edit.createlayermodaltitle',
    description: 'Title for the modal dialog to create a new layer',
    defaultMessage: 'Create empty layer'
  },
  layernamelabel: {
    id: 'edit.layernamelabel',
    description: 'Label for the layer name input field in the create layer modal',
    defaultMessage: 'Layer name'
  },
  geometrytypelabel: {
    id: 'edit.geometrytypelabel',
    description: 'Label for the geometry type combo in the create layer modal',
    defaultMessage: 'Geometry type'
  },
  pointgeomtype: {
    id: 'edit.pointgeomtype',
    description: 'Title for point geometry option in combo box',
    defaultMessage: 'Point'
  },
  linegeomtype: {
    id: 'edit.linegeomtype',
    description: 'Title for line geometry option in combo box',
    defaultMessage: 'LineString'
  },
  polygeomtype: {
    id: 'edit.polygeomtype',
    description: 'Title for polygon geometry option in combo box',
    defaultMessage: 'Polygon'
  },
  attributeslabel: {
    id: 'edit.attributeslabel',
    description: 'Label for attributes input field in new layer dialog',
    defaultMessage: 'Attributes (comma-separated names)'
  },
  strokecolorlabel: {
    id: 'edit.strokecolorlabel',
    description: 'Label for stroke color field in new layer dialog',
    defaultMessage: 'Stroke color'
  },
  fillcolorlabel: {
    id: 'edit.fillcolorlabel',
    description: 'Label for fill color field in new layer dialog',
    defaultMessage: 'Fill color'
  },
  createbuttontitle: {
    id: 'edit.createbuttontitle',
    description: 'Title for create button in new layer dialog',
    defaultMessage: 'Create empty layer'
  },
  createbuttontext: {
    id: 'edit.createbuttontext',
    description: 'Text for create button in new layer dialog',
    defaultMessage: 'Create'
  }
});

/**
 * A component that allows creating new features, so drawing their geometries and setting feature attributes through a form.
 */
@pureRender
class Edit extends MapTool {
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
    this._strokeColor = transformColor(color);
  }
  _onChangeFill(color) {
    this._fillColor = transformColor(color);
  }
  _generateId() {
    return ID_PREFIX + this.state.layers.length;
  }
  _createLayer() {
    var layerName = ReactDOM.findDOMNode(this.refs.layerName).value;
    var geometryType = ReactDOM.findDOMNode(this.refs.geometryType).value;
    var attributes = ReactDOM.findDOMNode(this.refs.attributes).value;
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
      var layers = this.state.layers.slice();
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
      var value = ReactDOM.findDOMNode(this.refs[NEW_ATTR_PREFIX + name]).value;
      feature.set(name, value);
    }
    this.refs.attributesModal.close();
  }
  _activate() {
    var layerId = ReactDOM.findDOMNode(this.refs.layer).value;
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
        this._interactions[layerId].draw.on('drawend', function(evt) {
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
    const {formatMessage} = this.props.intl;
    var options = [], i, ii;
    for (i = 0, ii = this.state.layers.length; i < ii; ++i) {
      var lyr = this.state.layers[i], title = lyr.get('title'), id = lyr.get('id');
      options.push(<option key={id} value={id}>{title}</option>);
    }
    if (options.length === 0) {
      var val = '[' + formatMessage(messages.nolayer) + ']';
      options.push(<option key={val} value={val}>{val}</option>);
    }
    var button;
    if (this.state.enable === true) {
      button = (<UI.DefaultButton onClick={this._enableEditMode.bind(this)}>{formatMessage(messages.enable)}</UI.DefaultButton>);
    } else {
      button = (<UI.DefaultButton onClick={this._disableEditMode.bind(this)}>{formatMessage(messages.disable)}</UI.DefaultButton>);
    }
    var attributeFormItems;
    if (this.state.attributes !== null) {
      attributeFormItems = [];
      for (i = 0, ii = this.state.attributes.length; i < ii; ++i) {
        var name = this.state.attributes[i], ref = NEW_ATTR_PREFIX + name;
        attributeFormItems.push(<div key={ref} className="form-group"><Grids.Col md={12}><label htmlFor={ref}>{name}</label></Grids.Col><Grids.Col md={8}><input id={ref} className="form-control" type='text' ref={ref} /></Grids.Col></div>);
      }
    }
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={true} withIcon={true}>{formatMessage(messages.nolayererror)}</Pui.ErrorAlert></div>);
    }
    return (
      <article>
        <form onSubmit={this._onSubmit} className='form-inline'>
          <Grids.Col md={6}>
            <UI.DefaultButton onClick={this._showModal.bind(this)}>{formatMessage(messages.newlayer)}</UI.DefaultButton>
          </Grids.Col>
          <Grids.Col md={10}>
            <Grids.Col md={8}>
            <label>{formatMessage(messages.layerlabel)}:</label>
            </Grids.Col>
            <Grids.Col md={16}>
            <select onChange={this._onLayerChange.bind(this)} ref='layer' className='form-control'>{options}</select>
            </Grids.Col>
          </Grids.Col>
          <Grids.Col md={8}>
            {button}
          </Grids.Col>
          <Grids.Col md={8}>
            {error}
          </Grids.Col>
        </form>
        <Dialog.Modal title={formatMessage(messages.newfeaturemodaltitle)} ref="attributesModal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              {attributeFormItems}
            </form>
          </Dialog.ModalBody>
         <Dialog.ModalFooter>
             <UI.DefaultButton title={formatMessage(messages.okbuttontitle)} onClick={this._setAttributes.bind(this)}>{formatMessage(messages.okbuttontext)}</UI.DefaultButton>
           </Dialog.ModalFooter>
        </Dialog.Modal>
        <Dialog.Modal title={formatMessage(messages.createlayermodaltitle)} ref="modal">
          <Dialog.ModalBody>
            <form className='form-horizontal'>
              <div className="form-group">
                <Grids.Col md={8}><label htmlFor='edit-layerName'>{formatMessage(messages.layernamelabel)}</label></Grids.Col>
                <Grids.Col md={12}><input id='edit-layerName' className="form-control" type="text" ref="layerName"/></Grids.Col>
              </div>
              <div className="form-group">
                <Grids.Col md={8}><label>{formatMessage(messages.geometrytypelabel)}</label></Grids.Col>
                <Grids.Col md={12}>
                  <select className='form-control' ref='geometryType'>
                    <option value='Point'>{formatMessage(messages.pointgeomtype)}</option>
                    <option value='LineString'>{formatMessage(messages.linegeomtype)}</option>
                    <option value='Polygon'>{formatMessage(messages.polygeomtype)}</option>
                  </select>
                </Grids.Col>
              </div>
              <div className="form-group">
                <Grids.Col md={8}><label htmlFor='edit-attributes'>{formatMessage(messages.attributeslabel)}</label></Grids.Col>
                <Grids.Col md={12}><input id='edit-attributes' className="form-control" type="text" ref="attributes"/></Grids.Col>
              </div>
              <div className="form-group">
                 <Grids.Col md={8}><label>{formatMessage(messages.strokecolorlabel)}</label></Grids.Col>
                 <Grids.Col md={12}><ColorPicker type='compact' onChangeComplete={this._onChangeStroke.bind(this)} ref='strokeColor' color={this._strokeColor} /></Grids.Col>
             </div>
             <div className="form-group">
               <Grids.Col md={8}><label>{formatMessage(messages.fillcolorlabel)}</label></Grids.Col>
               <Grids.Col md={12}><ColorPicker type='compact' onChangeComplete={this._onChangeFill.bind(this)} ref='fillColor' color={this._fillColor} /></Grids.Col>
             </div>
           </form>
         </Dialog.ModalBody>
         <Dialog.ModalFooter>
           <UI.DefaultButton title={formatMessage(messages.createbuttontitle)} onClick={this._createLayer.bind(this)}>{formatMessage(messages.createbuttontext)}</UI.DefaultButton>
         </Dialog.ModalFooter>
       </Dialog.Modal>
      </article>
    );
  }
}

Edit.propTypes = {
  /**
   * The stroke width in pixels used in the style for the created features.
   */
  strokeWidth: React.PropTypes.number,
  /**
   * The point radius used for the circle style.
   */
  pointRadius: React.PropTypes.number,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Edit.defaultProps = {
  strokeWidth: 2,
  pointRadius: 7
};

export default injectIntl(Edit);
