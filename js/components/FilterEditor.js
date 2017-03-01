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
import {ListItem} from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {red500} from 'material-ui/styles/colors';

const messages = defineMessages({
  attributelabel: {
    id: 'filtereditor.attributelabel',
    description: 'Label for the attribute select combo',
    defaultMessage: 'Attribute'
  },
  emptytext: {
    id: 'filtereditor.emptytext',
    description: 'Empty text for the attribute combo',
    defaultMessage: 'Select an attribute'
  },
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

const operators = [
  '==',
  '!=',
  '>',
  '>=',
  '<',
  '<='
];

/**
 * Editor for a single filter. Used by the RuleEditor.
 *
 * ```xml
 * <FilterEditor onChange={this._onChange.bind(this)} initialExpression={expression} />
 * ```
 */
class FilterEditor extends React.PureComponent {
  static propTypes = {
    /**
     * List of attributes.
     */
    attributes: React.PropTypes.array.isRequired,
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
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    initialExpression: null
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this.state = {
      attribute: props.attributes[0],
      operator: operators[0],
      hasError: false,
      expression: this.props.initialExpression
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  _isComplete() {
    return this.state.property && this.state.operator && this.state.value;
  }
  _generateFilter() {
    return [
      'all',
      [
        this.state.operator,
        this.state.property,
        this.state.value
      ]
    ];
  }
  _onChangeProperty(evt, idx, value) {
    var me = this;
    this.setState({property: value}, function() {
      if (me._isComplete()) {
        var filter = me._generateFilter();
        this.props.onChange({filter: filter});
      }
    });
  }
  _onChangeOperator(evt, id, value) {
    var me = this;
    this.setState({operator: value}, function() {
      if (me._isComplete()) {
        var filter = me._generateFilter();
        this.props.onChange({filter: filter});
      }
    });
  }
  _onChangeValue(evt, value) {
    var me = this;
    this.setState({value: value}, function() {
      if (me._isComplete()) {
        var filter = me._generateFilter();
        this.props.onChange({filter: filter});
      }
    });
  }
  render() {
    const listStyle = {
      padding: '0px 16px',
      marginLeft: 0
    };
    var attributeItems = [];
    attributeItems.push(<MenuItem key={0} style={{'minHeight':'32px'}} value={null} primaryText={' '} />);
    var i, ii;
    for (i = 0, ii = this.props.attributes.length; i < ii; ++i) {
      var attribute = this.props.attributes[i];
      attributeItems.push(<MenuItem key={i + 1} value={attribute} primaryText={attribute} />);
    }
    var operatorItems = [];
    for (i = 0, ii = operators.length; i < ii; ++i) {
      operatorItems.push(<MenuItem key={i} value={operators[i]} primaryText={operators[i]} />);
    }
    const {formatMessage} = this.props.intl;
    // TODO multiple rows
    return (
      <Paper className='style-contentContainer' zDepth={0}>
        <Subheader className='style-listHeader'>{formatMessage(messages.filterlabel)}</Subheader>
          <ListItem innerDivStyle={ listStyle } rightIcon={<ActionDelete color={red500} />}>
            <SelectField style={{width: 250}} ref='property' value={this.state.property} onChange={this._onChangeProperty.bind(this)}>
              {attributeItems}
            </SelectField>
            <SelectField style={{width: 75}} ref='operator' value={this.state.operator} onChange={this._onChangeOperator.bind(this)}>
              {operatorItems}
            </SelectField>
            <TextField style={{top: -27, width: 200}} name='value' ref='value' defaultValue={this.state.value} onChange={this._onChangeValue.bind(this)} />
          </ListItem>
      </Paper>
    );
  }
}

export default injectIntl(FilterEditor);
