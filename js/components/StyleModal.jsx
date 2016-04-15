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
import Grids from 'pui-react-grids';
import UI from 'pui-react-buttons';
import LayerActions from '../actions/LayerActions.js';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';
import {transformColor, doPOST} from '../util.js';
import RuleEditor from './RuleEditor.jsx';
import SLDService from '../services/SLDService.js';
import './StyleModal.css';

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
  },
  addrulebutton: {
    id: 'stylemodal.addrulebutton',
    description: 'Text for the add rule button',
    defaultMessage: 'Add'
  },
  addrulebuttontitle: {
    id: 'stylemodal.addrulebuttontitle',
    description: 'Title for the add rule button',
    defaultMessage: 'Add New Rule'
  },
  removerulebutton: {
    id: 'stylemodal.removerulebutton',
    description: 'Text for the remove rule button',
    defaultMessage: 'Remove'
  },
  removerulebuttontitle: {
    id: 'stylemodal.removerulebuttontitle',
    description: 'Text for the remove rule button',
    defaultMessage: 'Remove Selected Rule'
  },
  rulelabel: {
    id: 'stylemodal.rulelabel',
    description: 'Label for the rule combo box',
    defaultMessage: 'Rule:'
  }
});

/**
 * A modal for editing the style of a vector layer.
 */
@pureRender
class StyleModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this._styleState = {};
    this._styleCache = {};
    this.state = {
      attributes: [],
      rule: 'Rule 1',
      geometryType: null,
      rules: [{
        title: 'Rule 1'
      }]
    };
    this.props.layer.on('change:wfsInfo', this._setGeomTypeAndAttributes, this);
  }
  _setGeomTypeAndAttributes() {
    var wfsInfo = this.props.layer.get('wfsInfo');
    this.setState({attributes: wfsInfo.attributes, geometryType: wfsInfo.geometryType.replace('Multi', '')});
    this.props.layer.un('change:wfsInfo', this._setGeomTypeAndAttributes, this);
  }
  _createStyle(styleState) {
    var fill = new ol.style.Fill({
      color: transformColor(styleState.fillColor)
    });
    var stroke = new ol.style.Stroke({
      color: transformColor(styleState.strokeColor),
      width: styleState.strokeWidth
    });
    var text;
    if (styleState.labelAttribute) {
      text = new ol.style.Text({
        font: styleState.fontSize + 'px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: transformColor(styleState.fontColor)
        })
      });
    }
    var result;
    if (this.state.geometryType === 'Polygon') {
      result = new ol.style.Style({
        fill: fill,
        stroke: stroke,
        text: text
      });
    } else if (this.state.geometryType === 'LineString') {
      result = new ol.style.Style({
        stroke: stroke,
        text: text
      });
    } else if (this.state.geometryType === 'Point') {
      result = new ol.style.Style({
        image: new ol.style.Circle({
          fill: fill,
          stroke: stroke,
          radius: 4
        }),
        text: text
      });
    }
    return result;
  }
  _setStyle() {
    var layer = this.props.layer;
    if (layer instanceof ol.layer.Vector) {
      this._setStyleVector();
    } else {
      this._generateSLD();
    }
  }
  _generateSLD() {
    var sld = SLDService.createSLD(this.props.layer.get('id'), this.state.geometryType, this.state.rules, this._styleState);
    var url = this.props.layer.getSource().getUrls()[0];
    url = url.replace(/wms|ows|wfs/g, 'rest/styles/' + this.props.layer.get('styleName') + '.xml');
    doPOST(url, sld, function(xmlhttp) {
      this.props.layer.getSource().updateParams({'_olSalt': Math.random()});
      LayerActions.styleLayer(this.props.layer);
      this.close();
    }, function(xmlhttp) {
    }, this, 'application/vnd.ogc.sld+xml; charset=UTF-8', true);
  }
  _setStyleVector() {
    var me = this;
    // TODO cache as many style objects as possible
    this.props.layer.setStyle(function(feature) {
      // loop over the rules and see which one we match
      for (var i = me.state.rules.length - 1; i >= 0; --i) {
        var rule = me.state.rules[i].title;
        var styleState = me._styleState[rule];
        if (!styleState.filter || styleState.filter(feature.getProperties())) {
          var style = me._createStyle(styleState);
          if (styleState.labelAttribute) {
            var text = feature.get(styleState.labelAttribute);
            style.getText().setText(text ? '' + text : '');
          }
          return style;
        }
      }
      return null;
    });
    this.close();
  }
  _onChange(state) {
    var rule = this.state.rule;
    if (!this._styleState[rule]) {
      this._styleState[rule] = {};
    }
    Object.assign(this._styleState[rule], state);
  }
  _onRuleChange(evt) {
    this.setState({rule: evt.target.value});
  }
  _addRule() {
    var rules = this.state.rules.slice();
    var title = 'Rule ' + (this.state.rules.length + 1);
    rules.push({
      title: title
    });
    this.setState({rule: title, rules: rules});
  }
  _removeRule() {
    var rules = this.state.rules.slice();
    var idx;
    for (var i = 0, ii = rules.length; i < ii; ++i) {
      if (rules[i].title === this.state.rule) {
        idx = i;
        break;
      }
    }
    rules.splice(idx, 1);
    this.setState({rules: rules, rule: rules.length > 0 ? rules[0].title : null});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var ruleItems = this.state.rules.map(function(rule, key) {
      return (<option key={key} value={rule.title}>{rule.title}</option>);
    });
    // TODO see if we can do with a single rule editor
    var ruleEditors = this.state.rules.map(function(rule, key) {
      return (<RuleEditor {...this.props} geometryType={this.state.geometryType} visible={rule.title === this.state.rule} key={key} initialState={this._styleState[rule.title]} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />)
    }, this);
    return (
      <Dialog.BaseModal className="edit-layer-modal" title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <div className="clearfix form-group">
            <Grids.Col md={2}><label className="rule-label" htmlFor='ruleSelector'>{formatMessage(messages.rulelabel)}</label></Grids.Col>
            <Grids.Col md={6}><select ref='ruleSelector' value={this.state.rule} className='form-control' onChange={this._onRuleChange.bind(this)}>{ruleItems}</select></Grids.Col>
            <Grids.Col md={3}><UI.DefaultButton onClick={this._addRule.bind(this)} title={formatMessage(messages.addrulebuttontitle)}>{formatMessage(messages.addrulebutton)}</UI.DefaultButton></Grids.Col>
            <Grids.Col md={4}><UI.DefaultButton onClick={this._removeRule.bind(this)} title={formatMessage(messages.removerulebuttontitle)}>{formatMessage(messages.removerulebutton)}</UI.DefaultButton></Grids.Col>
          </div>
          {ruleEditors}
        </Dialog.ModalBody>
        <Dialog.ModalFooter>
          <UI.DefaultButton onClick={this._setStyle.bind(this)}>{formatMessage(messages.applybutton)}</UI.DefaultButton>
        </Dialog.ModalFooter>
      </Dialog.BaseModal>
    );
  }
}

StyleModal.propTypes = {
  /**
   * The layer associated with the style modal.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(StyleModal, {withRef: true});
