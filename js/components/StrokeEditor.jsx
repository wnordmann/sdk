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
import {transformColor} from '../util.js';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  strokewidthlabel: {
    id: 'strokeeditor.strokewidthlabel',
    description: 'Label for the stroke width input',
    defaultMessage: 'Stroke width'
  },
  strokecolorlabel: {
    id: 'strokeeditor.strokecolorlabel',
    description: 'Label for fill color picker',
    defaultMessage: 'Stroke color'
  }
});

@pureRender
class StrokeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      strokeColor: [0, 0, 0, 1],
      strokeWidth: 1
    };
    this.props.onChange(this.state);
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _onChangeStrokeWidth(evt) {
    this.state.strokeWidth = parseFloat(evt.target.value);
    this.props.onChange(this.state);
  }
  _onChangeStroke(color) {
    this.state.strokeColor = transformColor(color);
    this.props.onChange(this.state);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <form onSubmit={this._onSubmit} className='form-horizontal'>
        <div className='form-group'>
          <Grids.Col md={4}>
            <label htmlFor='strokeWidth'>{formatMessage(messages.strokewidthlabel)}:</label>
          </Grids.Col>
          <Grids.Col md={12}>
            <input ref='strokeWidth' id='strokeWidth' defaultValue={this.state.strokeWidth} onChange={this._onChangeStrokeWidth.bind(this)} />
          </Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={4}>
            <label>{formatMessage(messages.strokecolorlabel)}:</label>
          </Grids.Col>
          <Grids.Col md={12}>
            <ColorPicker type='compact' onChangeComplete={this._onChangeStroke.bind(this)} color={this.state.strokeColor} />
          </Grids.Col>
        </div>
      </form>
    );
  }
}

StrokeEditor.propTypes = {
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(StrokeEditor);
