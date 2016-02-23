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
import ReactDOM from 'react-dom';
import filtrex from 'filtrex';
import pureRender from 'pure-render-decorator';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './FilterEditor.css';

const messages = defineMessages({
  filterlabel: {
    id: 'filtereditor.filterlabel',
    description: 'Label for the filter expression input field',
    defaultMessage: 'Filter'
  },
  filterplaceholder: {
    id: 'filtereditor.filterplaceholder',
    description: 'Placeholder for the expression input field',
    defaultMessage: 'Type expression ....'
  },
  filterhelptext: {
    id: 'filtereditor.filterhelptext',
    description: 'filter help text',
    defaultMessage: 'ATTRIBUTE == "Value"'
  }
});

@pureRender
class FilterEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
    this._setInitialStateFromProp('filter', null);
    this._setInitialStateFromProp('expression', null);
  }
  _setInitialStateFromProp(prop, defaultVal) {
    if (this.props.styling && this.props.styling[prop]) {
      this.state[prop] = this.props.styling[prop];
    } else {
      this.state[prop] = defaultVal;
    }
  }
  _setQueryFilter() {
    var input = ReactDOM.findDOMNode(this.refs.queryExpression);
    var expression = input.value;
    if (!expression) {
      this.props.onChange({expression: null, filter: null});
      this.setState({hasError: false});
    } else {
      try {
        var filter = filtrex(expression);
        this.props.onChange({expression: expression, filter: filter});
        this.setState({hasError: false});
      } catch (e) {
        this.props.onChange({expression: null, filter: null});
        this.setState({hasError: true});
      }
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    var inputClassName = 'form-control';
    if (this.state.hasError) {
      inputClassName += ' input-has-error';
    }
    return (
      <input defaultValue={this.state.expression} onKeyUp={this._setQueryFilter.bind(this)} className={inputClassName} ref='queryExpression' placeholder={formatMessage(messages.filterplaceholder)} type='text' title={formatMessage(messages.filterhelptext)}/>
    );
  }
}

FilterEditor.propTypes = {
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

export default injectIntl(FilterEditor);
