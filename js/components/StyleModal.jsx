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
import classNames from 'classnames';
import Dialog from 'material-ui/lib/dialog';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import LayerActions from '../actions/LayerActions.js';
import RaisedButton from 'material-ui/lib/raised-button';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';
import {transformColor} from '../util.js';
import RuleEditor from './RuleEditor.jsx';
import SLDService from '../services/SLDService.js';
import RESTService from '../services/RESTService.js';
import Snackbar from 'material-ui/lib/snackbar';

const messages = defineMessages({
  title: {
    id: 'stylemodal.title',
    description: 'Title for the style modal dialog',
    defaultMessage: 'Edit layer style: {layer}'
  },
  errormsg: {
    id: 'stylemodal.errormsg',
    description: 'Error message to show the user when a request fails',
    defaultMessage: 'Error saving style to GeoServer. {msg}'
  },
  applybutton: {
    id: 'stylemodal.applybutton',
    description: 'Text for the apply button',
    defaultMessage: 'Apply'
  },
  closebutton: {
    id: 'stylemodal.closebutton',
    description: 'Text for the close button',
    defaultMessage: 'Close'
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
class StyleModal extends React.Component {
  constructor(props) {
    super(props);
    this._styleState = {};
    this._styleCache = {};
    this._ruleCounter = 1;
    this.state = {
      open: false,
      error: false,
      errorOpen: false,
      attributes: [],
      rule: 'Rule 1',
      geometryType: null,
      rules: [{
        name: 'Rule 1'
      }]
    };
  }
  componentDidMount() {
    if (this.props.layer.get('wfsInfo')) {
      this._setGeomTypeAndAttributes();
    } else {
      this.props.layer.on('change:wfsInfo', this._setGeomTypeAndAttributes, this);
    }
  }
  open() {
    if (this.props.layer.get('styleInfo')) {
      var rules = this.props.layer.get('styleInfo');
      for (var i = 0, ii = rules.length; i < ii; ++i) {
        this._styleState[rules[i].name] = rules[i];
      }
      this.setState({open: true, rule: rules[0].name, rules: rules});
    } else {
      this.setState({open: true});
    }
  }
  close() {
    this.setState({open: false});
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
    var me = this;
    var sld = SLDService.createSLD(this.props.layer.get('id'), this.state.geometryType, this.state.rules, this._styleState);
    var url = this.props.layer.getSource().getUrls()[0];
    if (this.props.layer.get('styleName')) {
      RESTService.updateStyle(url, this.props.layer, sld, function(xmlhttp) {
        me.props.layer.getSource().updateParams({'_olSalt': Math.random()});
        LayerActions.styleLayer(me.props.layer);
        me.close();
      }, function(xmlhttp) {
        me.setState({error: true, errorOpen: true, msg: xmlhttp.status + ' ' + xmlhttp.statusText});
      });
    } else {
      RESTService.createStyle(url, this.props.layer, sld, function(xmlhttp) {
        me.props.layer.getSource().updateParams({'STYLES': me.props.layer.get('styleName'), '_olSalt': Math.random()});
        LayerActions.styleLayer(me.props.layer);
        me.close();
      }, function(xmlhttp) {
        me.setState({error: true, errorOpen: true, msg: xmlhttp.status + ' ' + xmlhttp.statusText});
      });
    }
  }
  _setStyleVector() {
    var me = this;
    // TODO cache as many style objects as possible
    this.props.layer.setStyle(function(feature) {
      // loop over the rules and see which one we match
      for (var i = me.state.rules.length - 1; i >= 0; --i) {
        var rule = me.state.rules[i].name;
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
  _onRuleChange(evt, idx, value) {
    this.setState({rule: value});
  }
  _addRule() {
    this._ruleCounter++;
    var rules = this.state.rules.slice();
    var name = 'Rule ' + this._ruleCounter;
    rules.push({
      name: name
    });
    this.setState({rule: name, rules: rules});
  }
  _removeRule() {
    var rules = this.state.rules.slice();
    var idx;
    for (var i = 0, ii = rules.length; i < ii; ++i) {
      if (rules[i].name === this.state.rule) {
        idx = i;
        break;
      }
    }
    rules.splice(idx, 1);
    this.setState({rules: rules, rule: rules.length > 0 ? rules[0].name : null});
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        open={this.state.errorOpen}
        style={{transitionProperty : 'none'}}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var ruleItems = this.state.rules.map(function(rule, key) {
      return (<MenuItem key={key} value={rule.name} primaryText={rule.name} />);
    });
    // TODO see if we can do with a single rule editor
    var ruleEditors = this.state.rules.map(function(rule, key) {
      return (<RuleEditor {...this.props} geometryType={this.state.geometryType} visible={rule.name === this.state.rule} key={key} initialState={this._styleState[rule.name]} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />)
    }, this);
    var actions = [
      <RaisedButton label={formatMessage(messages.applybutton)} onTouchTap={this._setStyle.bind(this)} />,
      <RaisedButton label={formatMessage(messages.closebutton)} onTouchTap={this.close.bind(this)} />
    ];
    return (
      <Dialog className={classNames('sdk-component style-modal', this.props.className)} actions={actions} autoScrollBodyContent={true} modal={true} title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} open={this.state.open} onRequestClose={this.close.bind(this)}>
        <SelectField floatingLabelText={formatMessage(messages.rulelabel)} value={this.state.rule} onChange={this._onRuleChange.bind(this)}>
          {ruleItems}
        </SelectField>
        <RaisedButton label={formatMessage(messages.addrulebutton)} onTouchTap={this._addRule.bind(this)} />
        <RaisedButton label={formatMessage(messages.removerulebutton)} onTouchTap={this._removeRule.bind(this)} />
        {ruleEditors}
        {error}
      </Dialog>
    );
  }
}

StyleModal.propTypes = {
  /**
   * The layer associated with the style modal.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(StyleModal, {withRef: true});
