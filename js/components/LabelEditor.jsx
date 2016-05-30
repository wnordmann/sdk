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
import ColorPicker from 'react-color';
import MenuItem from 'material-ui/lib/menus/menu-item';
import classNames from 'classnames';
import SelectField from 'material-ui/lib/select-field';
import TextField from 'material-ui/lib/text-field';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  attributelabel: {
    id: 'labeleditor.attributelabel',
    description: 'Label for the attribute select combo',
    defaultMessage: 'Attribute'
  },
  fillcolorlabel: {
    id: 'labeleditor.fillcolorlabel',
    description: 'Label for fill color picker',
    defaultMessage: 'Font color'
  },
  sizelabel: {
    id: 'labeleditor.sizelabel',
    description: 'Label for the font size input',
    defaultMessage: 'Font size'
  },
  emptytext: {
    id: 'labeleditor.emptytext',
    description: 'Empty text for the attribute combo',
    defaultMessage: 'Select an attribute'
  }
});

/**
 * Editor for label properties. Can edit the label attribute, fontSize and fontColor.
 */
@pureRender
class LabelEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._setInitialStateFromProp('labelAttribute', null);
    this._setInitialStateFromProp('fontSize', 12);
    this._setInitialStateFromProp('fontColor', {rgb: {r: 0, g: 0, b: 0, a: 1}, hex: '000000'});
    this.props.onChange(this.state);
  }
  _setInitialStateFromProp(prop, defaultVal) {
    if (this.props.initialState && this.props.initialState[prop]) {
      this.state[prop] = this.props.initialState[prop];
    } else {
      this.state[prop] = defaultVal;
    }
  }
  _onItemChange(evt, idx, value) {
    this.setState({labelAttribute: value});
  }
  _onChangeFontSize(evt) {
    this.setState({fontSize: evt.currentTarget.value});
  }
  _onChangeFill(color) {
    this.setState({fontColor: color});
  }
  render() {
    this.props.onChange(this.state);
    const {formatMessage} = this.props.intl;
    var attributeItems = [];
    for (var i = 0, ii = this.props.attributes.length; i < ii; ++i) {
      var attribute = this.props.attributes[i];
      attributeItems.push(<MenuItem key={i} value={attribute} primaryText={attribute} />);
    }
    return (
      <div {...this.props} className={classNames('sdk-component label-editor', this.props.className)}>
        <SelectField floatingLabelText={formatMessage(messages.attributelabel)} hintText={formatMessage(messages.emptytext)} value={this.state.labelAttribute} onChange={this._onItemChange.bind(this)}>
          {attributeItems}
        </SelectField><br/>
        <TextField defaultValue={this.state.fontSize} floatingLabelText={formatMessage(messages.sizelabel)} onChange={this._onChangeFontSize.bind(this)} /><br/>
        <label>{formatMessage(messages.fillcolorlabel)}:</label>
        <ColorPicker type='compact' onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fontColor.rgb} />
      </div>
    );
  }
}

LabelEditor.propTypes = {
  /**
   * List of attributes.
   */
  attributes: React.PropTypes.array.isRequired,
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Initial state.
   */
  initialState: React.PropTypes.object,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(LabelEditor);
