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
import {defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';
import {transformColor} from '../util.js';
import RuleEditor from './RuleEditor.jsx';

const messages = defineMessages({
  title: {
    id: 'stylemodal.title',
    description: 'Title for the style modal dialog',
    defaultMessage: 'Edit layer style: {layer}'
  },
  applybutton: {
    id: 'stylemodal.applybutton',
    description: 'Text for the apply button',
    defaultMessage: 'Apply'
  }
});

@pureRender
class StyleModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this._styleState = {};
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
  _setStyle() {
    this.props.layer.setStyle(new ol.style.Style({
      fill: new ol.style.Fill({
        color: transformColor(this._styleState.fillColor)
      }),
      stroke: new ol.style.Stroke({
        color: transformColor(this._styleState.strokeColor),
        width: this._styleState.strokeWidth
      })
    }));
  }
  _onChange(state) {
    Object.assign(this._styleState, state);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <Dialog.BaseModal title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <RuleEditor styling={this._styleState} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />
        </Dialog.ModalBody>
        <Dialog.ModalFooter>
          <UI.DefaultButton onClick={this._setStyle.bind(this)}>{formatMessage(messages.applybutton)}</UI.DefaultButton>
        </Dialog.ModalFooter>
      </Dialog.BaseModal>
    );
  }
}

export default injectIntl(StyleModal, {withRef: true});
