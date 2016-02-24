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
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';
import {transformColor} from '../util.js';
import RuleEditor from './RuleEditor.jsx';
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
    defaultMessage: 'Add New Rule'
  },
  removerulebutton: {
    id: 'stylemodal.removerulebutton',
    description: 'Text for the remove rule button',
    defaultMessage: 'Remove Selected Rule'
  },
  rulelabel: {
    id: 'stylemodal.rulelabel',
    description: 'Label for the rule combo box',
    defaultMessage: 'Select Rule:'
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
    this.props.layer.on('change:wfsInfo', this._setGeomType, this);
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
  _setGeomType() {
    this.setState({geometryType: this.props.layer.get('wfsInfo').geometryType});
    this.props.layer.un('change:wfsInfo', this._setGeomType, this);
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
    var me = this;
    // TODO cache as many style objects as possible
    this.props.layer.setStyle(function(feature) {
      // loop over the rules and see which one we match
      for (var i = 0, ii = me.state.rules.length; i < ii; ++i) {
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
      return (<RuleEditor geometryType={this.state.geometryType} visible={rule.title === this.state.rule} key={key} initialState={this._styleState[rule.title]} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />)
    }, this);
    return (
      <Dialog.BaseModal title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <div className="clearfix form-group">
            <Grids.Col md={5}><label className="rule-label" htmlFor='ruleSelector'>{formatMessage(messages.rulelabel)}</label></Grids.Col>
            <Grids.Col md={4}><select ref='ruleSelector' value={this.state.rule} className='form-control' onChange={this._onRuleChange.bind(this)}>{ruleItems}</select></Grids.Col>
            <Grids.Col md={6}><UI.DefaultButton onClick={this._addRule.bind(this)}>{formatMessage(messages.addrulebutton)}</UI.DefaultButton></Grids.Col>
            <Grids.Col md={9}><UI.DefaultButton onClick={this._removeRule.bind(this)}>{formatMessage(messages.removerulebutton)}</UI.DefaultButton></Grids.Col>
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
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(StyleModal, {withRef: true});
