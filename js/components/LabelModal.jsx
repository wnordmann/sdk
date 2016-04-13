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
import Dialog from 'pui-react-modals';
import UI from 'pui-react-buttons';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';
import {transformColor} from '../util.js';
import LabelEditor from './LabelEditor.jsx';

const messages = defineMessages({
  title: {
    id: 'labelmodal.title',
    description: 'Title for the label modal dialog',
    defaultMessage: 'Label for layer {layer}'
  },
  applybutton: {
    id: 'labelmodal.applybutton',
    description: 'Text for the apply button',
    defaultMessage: 'Apply'
  },
  clearbutton: {
    id: 'labelmodal.clearbutton',
    description: 'Text for the clear button',
    defaultMessage: 'Clear'
  }
});

/**
 * A modal window for applying labels to a vector layer.
 */
@pureRender
class LabelModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this.state = {
      attributes: []
    };
    var source = this.props.layer.getSource();
    if (source && !(source instanceof ol.source.Cluster)) {
      source.on('change', function(evt) {
        if (evt.target.getState() === 'ready' && this.state.attributes.length === 0) {
          var feature = evt.target.getFeatures()[0];
          if (feature) {
            var geom = feature.getGeometryName();
            var keys = feature.getKeys();
            var idx = keys.indexOf(geom);
            keys.splice(idx, 1);
            this.state.attributes = keys;
          }
        }
      }, this);
    }
  }
  _setStyleFunction() {
    var layer = this.props.layer;
    var style = layer.getStyle();
    this._style = style;
    this._styleSet = true;
    var me = this;
    layer.setStyle(function(feature, resolution) {
      var rawValue = feature.get(me._labelState.labelAttribute);
      var value = '';
      if (rawValue !== undefined) {
        value += rawValue;
      }
      var text = new ol.style.Text({
        text: value,
        font: me._labelState.fontSize + 'px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: transformColor(me._labelState.fontColor)
        })
      });
      var modifyStyle = function(s) {
        // TODO, see if we can optimize / cache this
        if (s instanceof ol.style.Style) {
          s = [s];
        } else {
          s = s.slice();
        }
        s.push(new ol.style.Style({
          text: text
        }));
        return s;
      };
      if (style instanceof ol.style.Style || Array.isArray(style)) {
        return modifyStyle(style);
      } else {
        var result = style.call(me, feature, resolution);
        return modifyStyle(result);
      }
    });
  }
  _clearLabel() {
    if (this._style) {
      this.props.layer.setStyle(this._style);
      this._styleSet = false;
    }
  }
  _onChangeLabel(labelState) {
    this._labelState = labelState;
  }
  _setLabel() {
    if (!this._styleSet) {
      this._setStyleFunction();
    } else {
      this.props.layer.changed();
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <Dialog.BaseModal title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <LabelEditor {...this.props} initialState={this._labelState} onChange={this._onChangeLabel.bind(this)} attributes={this.state.attributes} />
        </Dialog.ModalBody>
        <Dialog.ModalFooter>
          <UI.DefaultButton onClick={this._setLabel.bind(this)}>{formatMessage(messages.applybutton)}</UI.DefaultButton>
          <UI.DefaultButton onClick={this._clearLabel.bind(this)}>{formatMessage(messages.clearbutton)}</UI.DefaultButton>
        </Dialog.ModalFooter>
      </Dialog.BaseModal>
    );
  }
}

LabelModal.propTypes = {
  /**
   * The layer associated with the style modal.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(LabelModal, {withRef: true});
