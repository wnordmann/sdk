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
import pureRender from 'pure-render-decorator';

/**
 * Style editor for fill color.
 */
@pureRender
class FillEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._setInitialStateFromProp('fillColor', {r: 255, g: 0, b: 0, a: 0.5});
    this.props.onChange(this.state);
  }
  _setInitialStateFromProp(prop, defaultVal) {
    if (this.props.styling && this.props.styling[prop]) {
      this.state[prop] = this.props.styling[prop];
    } else {
      this.state[prop] = defaultVal;
    }
  }
  _onChangeFill(color) {
    this.state.fillColor = color.rgb;
    this.props.onChange(this.state);
  }
  render() {
    return (
      <ColorPicker type='chrome' onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fillColor} />
    );
  }
}

FillEditor.propTypes = {
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Initial state.
   */
  styling: React.PropTypes.object
};

export default FillEditor;
