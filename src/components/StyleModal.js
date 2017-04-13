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
import Dialog from './Dialog';
import {List, ListItem} from 'material-ui/List';
import LayerActions from '../actions/LayerActions';
import Button from './Button';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import RuleEditor from './RuleEditor';
import SLDService from '../services/SLDService';
import OpenLayersService from '../services/OpenLayersService';
import RESTService from '../services/RESTService';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';
import FilterService from '../services/FilterService';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import NewRuleModal from './NewRuleModal';
import './StyleModal.css';

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
  closebutton: {
    id: 'stylemodal.closebutton',
    description: 'Text for the close button',
    defaultMessage: 'Close'
  },
  savebutton: {
    id: 'stylemodal.savebutton',
    description: 'Text for the save button',
    defaultMessage: 'SAVE'
  },
  addrulebutton: {
    id: 'stylemodal.addrulebutton',
    description: 'Text for the add rule button',
    defaultMessage: 'ADD'
  },
  addrulebuttontitle: {
    id: 'stylemodal.addrulebuttontitle',
    description: 'Title for the add rule button',
    defaultMessage: 'Add New Rule'
  }
});

/**
 * A modal or drawer for editing the style of a layer.
 *
 * ```xml
 * <StyleModal layer={this.props.layer} />
 * ```
 */
class StyleModal extends React.PureComponent {
  static propTypes = {
    /**
     * Should we show inline instead of modal?
     */
    inline: React.PropTypes.bool,
    /**
     * The layer associated with the style modal.
     */
    layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
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
    muiTheme: React.PropTypes.object,
    proxy: React.PropTypes.string,
    requestHeaders: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this._proxy = context.proxy;
    this._requestHeaders = context.requestHeaders;
    this._styleCache = {};
    this._ruleCounter = 0;
    this.state = {
      newRuleOpen: false,
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
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentDidMount() {
    if (this.props.layer.get('wfsInfo')) {
      this._setGeomTypeAndAttributes();
    } else {
      this.props.layer.once('change:wfsInfo', this._setGeomTypeAndAttributes, this);
    }
    if (this.props.layer.get('styleInfo')) {
      this._setRules();
    } else {
      this.props.layer.once('change:styleInfo', this._setRules, this);
    }
  }
  _setRules() {
    // only support for a single featureTypeStyle now
    var rules = this.props.layer.get('styleInfo').featureTypeStyles[0].rules;
    for (var i = 0, ii = rules.length; i < ii; ++i) {
      if (rules[i].name === undefined) {
        rules[i].name = rules[i].title ? rules[i].title : 'Untitled ' + (i + 1);
      }
    }
    this.setState({rule: rules[0].name, rules: rules}, function() {
      if (this.props.layer instanceof ol.layer.Vector) {
        this._setStyleVector();
      }
    });
  }
  close() {
    this.props.onRequestClose();
  }
  _setGeomTypeAndAttributes() {
    var wfsInfo = this.props.layer.get('wfsInfo');
    this.setState({attributes: wfsInfo.attributes, geometryType: wfsInfo.geometryType.replace('Multi', '')});
    this.props.layer.un('change:wfsInfo', this._setGeomTypeAndAttributes, this);
  }
  _createStyle(styleState) {
    return OpenLayersService.createStyle(styleState, this.state.geometryType);
  }
  _setStyle() {
    var layer = this.props.layer;
    if (layer instanceof ol.layer.Vector) {
      this._setStyleVector();
    } else {
      this._generateSLD();
    }
  }
  _saveStyle() {
    var me = this;
    var sld = SLDService.createSLD(this.props.layer, this.state.geometryType, [{
      rules: this.state.rules
    }]);
    if (this.props.layer.get('styleName')) {
      RESTService.updateStyle(this.props.layer, sld, function(xmlhttp) {
        me.close();
      }, function(xmlhttp) {
        me.setState({error: true, errorOpen: true, msg: xmlhttp.status + ' ' + xmlhttp.statusText});
      }, this._proxy, this._requestHeaders);
    } else {
      RESTService.createStyle(this.props.layer, sld, function(xmlhttp) {
        me.props.layer.getSource().updateParams({'STYLES': me.props.layer.get('styleName'), '_olSalt': Math.random()});
        LayerActions.styleLayer(me.props.layer);
        me.close();
      }, function(xmlhttp) {
        me.setState({error: true, errorOpen: true, msg: xmlhttp.status + ' ' + xmlhttp.statusText});
      }, this._proxy, this._requestHeaders);
    }
  }
  _generateSLD() {
    var sld = SLDService.createSLD(this.props.layer, this.state.geometryType, [{
      rules: this.state.rules
    }]);
    if (!(this._sld && this._sld === sld)) {
      this.props.layer.getSource().updateParams({'SLD_BODY': sld, 'TILED': false});
      LayerActions.styleLayer(this.props.layer);
    }
  }
  _setStyleVector() {
    var me = this;
    // TODO cache as many style objects as possible
    this.props.layer.setStyle(function(feature) {
      // loop over the rules and see which one we match
      var styles = [], filter;
      for (var i = me.state.rules.length - 1; i >= 0; --i) {
        var rule = me.state.rules[i];
        var styleState = rule;
        var filterParseError = false;
        if (styleState.expression) {
          var expression = FilterService.filterToExpression(styleState.expression);
          try {
            filter = FilterService.filter(expression);
          } catch (e) {
            filterParseError = true;
          }
        }
        if (!filterParseError && (!filter || filter(feature.getProperties()))) {
          var style = me._createStyle(styleState);
          for (var j = 0, jj = style.length; j < jj; ++j) {
            if (style[j].getText()) {
              var text = feature.get(styleState.symbolizers[j].labelAttribute);
              style[j].getText().setText(text ? '' + text : '');
            }
          }
          styles = styles.concat(style);
        }
      }
      return styles;
    });
  }
  _onChange(ruleName, state) {
    // TODO support more symbolizers
    var rule = this._getRuleByName(ruleName);
    if (state.expression) {
      rule.expression = state.expression;
    } else {
      var symbolizers = rule.symbolizers;
      var styleState = symbolizers[0];
      Object.assign(styleState, state);
    }
    this._setStyle();
  }
  _removeRule(name) {
    var rules = this.state.rules.slice();
    var idx;
    for (var i = 0, ii = rules.length; i < ii; ++i) {
      if (rules[i].name === name) {
        idx = i;
        break;
      }
    }
    rules.splice(idx, 1);
    this.setState({rules: rules, rule: rules.length > 0 ? rules[0].name : null}, this._setStyle);
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  _getRuleByName(ruleName) {
    for (var i = 0, ii = this.state.rules.length; i < ii; ++i) {
      if (this.state.rules[i].name === ruleName) {
        return this.state.rules[i];
      }
    }
  }
  _addNewRule(name) {
    var rules = this.state.rules.slice();
    rules.push({name: name, symbolizers: [{}]});
    this.setState({rules: rules, rule: name, newRuleOpen: false});
  }
  _addRule() {
    this.setState({
      newRuleOpen: true
    });
  }
  closeNew() {
    this.setState({
      newRuleOpen: false
    });
  }
  _resizeDialog() {
    this.refs.dialog.forceUpdate();
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        open={this.state.errorOpen}
        bodyStyle={{lineHeight: '24px', height: 'auto'}}
        style={{bottom: 'auto', top: 0, position: 'absolute'}}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var ruleItems = this.state.rules.map(function(rule, key) {
      // only support a single symbolizer for now
      var ruleObj = this._getRuleByName(rule.name);
      var editor = (<RuleEditor onRemove={this._removeRule.bind(this, rule.name)} {...this.props} geometryType={this.state.geometryType} key={key} initialState={ruleObj} onChange={this._onChange.bind(this, rule.name)} attributes={this.state.attributes} />);
      return (<span key={key}><ListItem onNestedListToggle={this._resizeDialog.bind(this)} nestedItems={[editor]} primaryTogglesNestedList={true} primaryText={rule.name} /><Divider /></span>);
    }, this);
    var actions = [
      <Button buttonType='Flat' label={formatMessage(messages.addrulebutton)} tooltipPosition='top' tooltip={formatMessage(messages.addrulebuttontitle)} onTouchTap={this._addRule.bind(this)} />,
      <Button buttonType='Flat' primary={true} label={formatMessage(messages.savebutton)} onTouchTap={this._saveStyle.bind(this)} />
    ];
    return (
      <span>
        <Dialog ref='dialog' autoScrollBodyContent={true} inline={this.props.inline} title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} className='style-modal' actions={actions} open={this.props.open} onRequestClose={this.close.bind(this)}>
          <List>
            {ruleItems}
          </List>
          {error}
        </Dialog>
        <NewRuleModal intl={this.props.intl} inline={this.props.inline} open={this.state.newRuleOpen} onRequestClose={this.closeNew.bind(this)} onAdd={this._addNewRule.bind(this)} />
      </span>
    );
  }
}

export default injectIntl(StyleModal);
