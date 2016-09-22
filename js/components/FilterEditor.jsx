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
import TextField from 'material-ui/TextField';
import FilterService from '../services/FilterService.js';
import pureRender from 'pure-render-decorator';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

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
  errortext: {
    id: 'filtereditor.errortext',
    description: 'filter error text',
    defaultMessage: 'Invalid filter, use for instance ATTRIBUTE == "Value"'
  }
});

/**
 * Editor for a single filter using FilterService. Can for instance be used in a style dialog.
 */
@pureRender
class FilterEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      expression: this.props.initialExpression
    };
  }
  _setQueryFilter(evt) {
    var expression = evt.target.value;
    if (!expression) {
      this.props.onChange({expression: null, filter: null});
      this.setState({hasError: false});
    } else {
      try {
        var filter = FilterService.filter(expression);
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
    var errorText;
    if (this.state.hasError) {
      errorText = formatMessage(messages.errortext);
    }
    return (
      <TextField className={classNames('sdk-component filter-editor', this.props.className)} errorText={errorText} hintText={formatMessage(messages.filterplaceholder)} defaultValue={this.state.expression} ref='queryExpression' onChange={this._setQueryFilter.bind(this)} />
    );
  }
}

FilterEditor.propTypes = {
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * Initial expression.
   */
  initialExpression: React.PropTypes.string,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

FilterEditor.defaultProps = {
  initialFilter: null,
  initialExpression: null
};

export default injectIntl(FilterEditor);
