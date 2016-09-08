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
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import Checkbox from 'material-ui/lib/checkbox';
import FillEditor from './FillEditor.jsx';
import StrokeEditor from './StrokeEditor.jsx';
import Paper from 'material-ui/lib/paper';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  filllabel: {
    id: 'pointsymbolizereditor.filllabel',
    description: 'Label for fill checkbox',
    defaultMessage: 'Fill'
  },
  strokelabel: {
    id: 'pointsymbolizereditor.strokelabel',
    description: 'Label for stroke checkbox',
    defaultMessage: 'Stroke'
  }
});

/**
 * Style editor for a point symbolizer.
 */
@pureRender
class PointSymbolizerEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFill: props.initialState ? props.initialState.fillColor : true,
      hasStroke: true
    };
  }
  _onFillCheck(evt) {
    this.setState({hasFill: evt.target.checked});
    this.props.onChange({
      hasFill: evt.target.checked
    });
  }
  _onStrokeCheck(evt) {
    this.setState({hasStroke: evt.target.checked});
    this.props.onChange({
      hasStroke: evt.target.checked
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <div className={classNames('sdk-component point-symbolizer-editor', this.props.className)}>
        <Paper>
          <Checkbox onCheck={this._onFillCheck.bind(this)} checked={this.state.hasFill} label={formatMessage(messages.filllabel)} />
          <FillEditor onChange={this.props.onChange} intl={this.props.intl} initialFillColor={this.props.initialState ? this.props.initialState.fillColor : undefined} />
        </Paper>
        <Paper>
          <Checkbox onCheck={this._onStrokeCheck.bind(this)} checked={this.state.hasStroke} label={formatMessage(messages.strokelabel)} />
          <StrokeEditor onChange={this.props.onChange} intl={this.props.intl} initialStrokeColor={this.props.initialState ? this.props.initialState.strokeColor : undefined} initialStrokeWidth={this.props.initialState ? this.props.initialState.strokeWidth : undefined} />
        </Paper>
      </div>
    );
  }
}

PointSymbolizerEditor.propTypes = {
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Initial state for the point symbolizer.
   */
  initialState: React.PropTypes.object,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(PointSymbolizerEditor);
