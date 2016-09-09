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
import SelectField from 'material-ui/lib/select-field';
import Paper from 'material-ui/lib/paper';
import MenuItem from 'material-ui/lib/menus/menu-item';
import TextField from 'material-ui/lib/text-field';
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
  },
  symboltype: {
    id: 'pointsymbolizereditor.symboltype',
    description: 'Label for symbol select field',
    defaultMessage: 'Symbol'
  },
  symbolsize: {
    id: 'pointsymbolizereditor.symbolsize',
    description: 'Label for symbol size input field',
    defaultMessage: 'Size'
  }
});

const symboltypes = [
  'circle',
  'square',
  'triangle',
  'star',
  'cross',
  'x'
];

/**
 * Style editor for a point symbolizer.
 */
@pureRender
class PointSymbolizerEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFill: props.initialState ? props.initialState.fillColor !== undefined : true,
      hasStroke: true,
      symbolType: props.initialState && props.initialState.symbolType ? props.initialState.symbolType : 'circle',
      symbolSize: props.initialState && props.initialState.symbolSize ? props.initialState.symbolSize : '4'
    };
  }
  _onFillCheck(evt) {
    this.setState({hasFill: evt.target.checked}, function() {
      this.props.onChange(this.state);
    });
  }
  _onStrokeCheck(evt) {
    this.setState({hasStroke: evt.target.checked}, function() {
      this.props.onChange(this.state);
    });
  }
  _onChangeSymbol(evt, idx, value) {
    this.setState({symbolType: value}, function() {
      this.props.onChange(this.state);
    });
  }
  _onSymbolSizeChange(evt) {
    this.setState({symbolSize: evt.target.value}, function() {
      this.props.onChange(this.state);
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var options = symboltypes.map(function(symbol, idx) {
      return (<MenuItem key={idx} value={symbol} primaryText={symbol} />);
    });
    return (
      <div className={classNames('sdk-component point-symbolizer-editor', this.props.className)}>
        <Paper>
          <SelectField floatingLabelText={formatMessage(messages.symboltype)} value={this.state.symbolType} onChange={this._onChangeSymbol.bind(this)}>
            {options}
          </SelectField>
          <TextField value={this.state.symbolSize} onChange={this._onSymbolSizeChange.bind(this)} floatingLabelText={formatMessage(messages.symbolsize)} />
        </Paper>
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
