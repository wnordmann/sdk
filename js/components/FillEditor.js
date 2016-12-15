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
import classNames from 'classnames';
import ColorPicker from 'react-color';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import Label from './Label';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  fillcolorlabel: {
    id: 'filleditor.fillcolorlabel',
    description: 'Label for fill color picker',
    defaultMessage: 'Fill color'
  }
});

/**
 * Style editor for fill color.
 *
 * ```xml
 * <FillEditor onChange={this._onChange.bind(this)} initialFillColor={{rgb: {r: 0, g: 255, b: 0, a: 0.5}, hex: '#00FF00'}}/>
 * ```
 */
@pureRender
class FillEditor extends React.Component {
  static propTypes = {
    /**
     * Callback that is called when a change is made.
     */
    onChange: React.PropTypes.func.isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Initial fill color.
     */
    initialFillColor: React.PropTypes.object,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static defaultProps = {
    initialFillColor: {
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      },
      hex: '#FF0000'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      fillColor: this.props.initialFillColor
    };
  }
  _onChangeFill(color) {
    this.setState({fillColor: color});
    this.props.onChange(this.state);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <div className={classNames('sdk-component stroke-editor', this.props.className)}>
        <Label>{formatMessage(messages.fillcolorlabel)}:</Label>
        <ColorPicker type='chrome' onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fillColor.rgb} />
      </div>
    );
  }
}

export default injectIntl(FillEditor);
