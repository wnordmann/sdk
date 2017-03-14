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
import LayerStore from '../stores/LayerStore';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ToolUtil from '../toolutil';
import {injectIntl, intlShape} from 'react-intl';
import Button from './Button';
import CloserIcon from 'material-ui/svg-icons/navigation/close';
import classNames from 'classnames';
import WFSService from '../services/WFSService';
import EditForm from './EditForm';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import './BasePopup.css';

/**
 * Popup that can be used for feature editing (attribute form).
 *
 * ```xml
 * <EditPopup map={map} />
 * ```
 */
class EditPopup extends React.Component {
  static propTypes = {
    /**
     * The ol3 map to register for singleClick.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    proxy: React.PropTypes.string,
    requestHeaders: React.PropTypes.object,
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    this._dispatchToken = ToolUtil.register(this);
    this.state = {
      feature: null,
      layer: null
    };
    this.props.map.on('singleclick', this._onMapClick, this);
    this.active = true;
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentDidMount() {
    this.overlayPopup = new ol.Overlay({
      autoPan: true,
      element: ReactDOM.findDOMNode(this).parentNode
    });
    this.props.map.addOverlay(this.overlayPopup);
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  activate(interactions) {
    this.active = true;
    // it is intentional not to call activate on ToolUtil here
  }
  deactivate() {
    this.active = false;
    // it is intentional not to call deactivate on ToolUtil here
  }
  _getLayers() {
    var state = LayerStore.getState();
    var layers = [];
    for (var i = 0, ii = state.flatLayers.length; i < ii; ++i) {
      var layer = state.flatLayers[i];
      if (layer instanceof ol.layer.Tile && layer.getVisible() && (layer.getSource() instanceof ol.source.TileWMS && layer.get('popupInfo'))) {
        layers.push(layer);
      }
    }
    return layers;
  }
  _onMapClick(evt) {
    if (this.active) {
      var map = this.props.map;
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var me = this;
      var found = false;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          if (layer !== null && layer.get('isWFST')) {
            found = true;
            me.setState({
              feature: feature,
              layer: layer
            }, function() {
              me.setVisible(true);
              me.overlayPopup.setPosition(coord);
            });
          }
        }
      });
      if (!found) {
        // try WFS queries
        var layers = this._getLayers();
        for (var i = 0, ii = layers.length; i < ii; ++i) {
          WFSService.distanceWithin(layers[i], map.getView(), coord, (function(feature) {
            me.setState({
              feature: feature,
              layer: this
            }, function() {
              me.setVisible(true);
              me.overlayPopup.setPosition(coord);
            });
          }).bind(layers[i]), undefined, this._proxy, this._requestHeaders);
        }
      }
    }
  }
  _onSuccess() {
    this.setVisible(false);
  }
  setVisible(visible) {
    ReactDOM.findDOMNode(this).parentNode.style.display = visible ? 'block' : 'none';
    var me = this;
    // regular jsx onClick does not work when stopEvent is true
    var closer = ReactDOM.findDOMNode(this.refs.popupCloser);
    if (closer.onclick === null) {
      closer.onclick = function() {
        me.setVisible(false);
        return false;
      };
    }
    var editForm = this.refs.editForm;
    if (editForm) {
      var formInstance = editForm.getWrappedInstance();
      var saveButton = ReactDOM.findDOMNode(formInstance.refs.saveButton).querySelector('button');
      if (saveButton && saveButton.onclick === null) {
        saveButton.onclick = function() {
          formInstance.save();
          return false;
        };
      }
      var deleteButton = ReactDOM.findDOMNode(formInstance.refs.deleteButton).querySelector('button');
      if (deleteButton && deleteButton.onclick === null) {
        deleteButton.onclick = function() {
          formInstance.deleteFeature();
          return false;
        };
      }
    }
  }
  render() {
    var editForm;
    if (this.state.feature) {
      editForm = (<EditForm map={this.props.map} ref='editForm' intl={this.props.intl} feature={this.state.feature} layer={this.state.layer} onSuccess={this._onSuccess.bind(this)} />);
    }
    return (
      <div className={classNames('sdk-component edit-popup', this.props.className)}>
        <Button buttonType='Icon' buttonStyle={{float: 'right'}} ref="popupCloser" onTouchTap={this.setVisible.bind(this, false)}><CloserIcon /></Button>
        <div className='popup-content' ref='content'>
          {editForm}
        </div>
      </div>
    );
  }
}

export default injectIntl(EditPopup);
