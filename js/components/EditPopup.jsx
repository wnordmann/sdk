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
import BasePopup from './BasePopup.jsx';
import ol from 'openlayers';
import {injectIntl, intlShape} from 'react-intl';
import IconButton from 'material-ui/lib/icon-button';
import CloserIcon from 'material-ui/lib/svg-icons/navigation/close';
import classNames from 'classnames';
import EditForm from './EditForm.jsx';

/**
 * Popup that can be used for feature editing (attribute form).
 *
 * ```xml
 * <div id='popup' className='ol-popup'><EditPopup map={map} /></div>
 * ```
 */
class EditPopup extends BasePopup {
  constructor(props) {
    super(props);
    this.state = {
      feature: null,
      layer: null
    };
    this.props.map.on('singleclick', this._onMapClick, this);
    this.active = true;
  }
  _onMapClick(evt) {
    if (this.active) {
      var map = this.props.map;
      if (super.hasActiveDrawModify()) {
        return;
      }
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord = evt.coordinate;
      var me = this;
      var cont = false;
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (feature) {
          if (layer.get('isWFST')) {
            cont = true;
            me.setState({
              feature: feature,
              layer: layer
            });
          }
        }
      });
      if (cont === true) {
        me.overlayPopup.setPosition(coord);
        me.setVisible(true);
      } else {
        me.setVisible(false);
      }
    }
  }
  _onSuccess() {
    this.setVisible(false);
  }
  setVisible(visible) {
    super.setVisible(visible);
    var formInstance = this.refs.editForm.getWrappedInstance();
    var saveButton = ReactDOM.findDOMNode(formInstance.refs.saveButton);
    if (saveButton && saveButton.onclick === null) {
      saveButton.onclick = function() {
        formInstance._save();
        return false;
      };
    }
  }
  render() {
    var editForm;
    if (this.state.feature) {
      editForm = (<EditForm ref='editForm' feature={this.state.feature} layer={this.state.layer} onSuccess={this._onSuccess.bind(this)} />);
    }
    return (
      <div className={classNames('sdk-component edit-popup', this.props.className)}>
        <IconButton style={{float: 'right'}} ref="popupCloser" onTouchTap={this.setVisible.bind(this, false)}><CloserIcon /></IconButton>
        <div className='popup-content' ref='content'>
          {editForm}
        </div>
      </div>
    );
  }
}

EditPopup.propTypes = {
  /**
   * The ol3 map to register for singleClick.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(EditPopup);
