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
import Grids from 'pui-react-grids';
import ColorPicker from 'react-color';
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
  }
});

const nullValue = 'NULL';

@pureRender
class LabelEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._setInitialStateFromProp('labelAttribute', null);
    this._setInitialStateFromProp('fontSize', 12);
    this._setInitialStateFromProp('fontColor', {r: 0, g: 0, b: 0, a: 1});
    this.props.onChange(this.state);
  }
  _setInitialStateFromProp(prop, defaultVal) {
    if (this.props.styling && this.props.styling[prop]) {
      this.state[prop] = this.props.styling[prop];
    } else {
      this.state[prop] = defaultVal;
    }
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _onItemChange(evt) {
    this.state.labelAttribute = evt.target.value === nullValue ? null : evt.target.value;
    this.props.onChange(this.state);
  }
  _onChangeFontSize(evt) {
    this.state.fontSize = evt.target.value;
    this.props.onChange(this.state);
  }
  _onChangeFill(color) {
    this.state.fontColor = color.rgb;
    this.props.onChange(this.state);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var attributeItems = [(<option value={nullValue} key={0}>Select an attribute</option>)];
    for (var i = 0, ii = this.props.attributes.length; i < ii; ++i) {
      var attribute = this.props.attributes[i];
      attributeItems.push(<option value={attribute} key={i + 1}>{attribute}</option>);
    }
    return (
      <form onSubmit={this._onSubmit} className='form-horizontal'>
        <div className="form-group">
          <Grids.Col md={4}>
            <label htmlFor='labelSelector'>{formatMessage(messages.attributelabel)}:</label>
          </Grids.Col>
          <Grids.Col md={12}>
            <select id='labelSelector' defaultValue={this.state.labelAttribute} onChange={this._onItemChange.bind(this)}>
              {attributeItems}
            </select>
          </Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={4}>
            <label htmlFor='fontSize'>{formatMessage(messages.sizelabel)}:</label>
          </Grids.Col>
          <Grids.Col md={12}>
            <input ref='fontSize' id='fontSize' defaultValue={this.state.fontSize} onChange={this._onChangeFontSize.bind(this)} />
          </Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={4}>
            <label>{formatMessage(messages.fillcolorlabel)}:</label>
          </Grids.Col>
          <Grids.Col md={12}>
            <ColorPicker type='compact' onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fontColor} />
          </Grids.Col>
        </div>
      </form>
    );
  }
}

LabelEditor.propTypes = {
  /**
   * List of attributes.
   */
  attributes: React.PropTypes.array,
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Initial state.
   */
  styling: React.PropTypes.object,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(LabelEditor);
