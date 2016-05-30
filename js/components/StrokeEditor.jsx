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
import classNames from 'classnames';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import TextField from 'material-ui/lib/text-field';
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

/**
 * Style editor for stroke properties (color and width).
 */
@pureRender
class StrokeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._setInitialStateFromProp('strokeColor', {rgb: {r: 0, g: 0, b: 0, a: 1}, hex: '000000'});
    this._setInitialStateFromProp('strokeWidth', 1);
    this.props.onChange(this.state);
  }
  _setInitialStateFromProp(prop, defaultVal) {
    if (this.props.initialState && this.props.initialState[prop]) {
      this.state[prop] = this.props.initialState[prop];
    } else {
      this.state[prop] = defaultVal;
    }
  }
  _onChangeStrokeWidth(evt, idx, value) {
    this.setState({strokeWidth: parseFloat(value)});
  }
  _onChangeStroke(color) {
    this.setState({strokeColor: color});
  }
  render() {
    this.props.onChange(this.state);
    const {formatMessage} = this.props.intl;
    return (
      <div {...this.props} className={classNames('sdk-component stroke-editor', this.props.className)}>
        <TextField defaultValue={this.state.strokeWidth} floatingLabelText={formatMessage(messages.strokewidthlabel)} onChange={this._onChangeStrokeWidth.bind(this)} /><br/>
        <label>{formatMessage(messages.strokecolorlabel)}:</label>
        <ColorPicker type='chrome' onChangeComplete={this._onChangeStroke.bind(this)} color={this.state.strokeColor.rgb} />
      </div>
    );
  }
}

StrokeEditor.propTypes = {
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Initial state.
   */
  initialState: React.PropTypes.object,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(StrokeEditor);
