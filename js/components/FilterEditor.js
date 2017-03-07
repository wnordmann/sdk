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
import {List, ListItem} from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Button from './Button';
import {ToolbarGroup} from 'material-ui/Toolbar';
import {red500} from 'material-ui/styles/colors';

const messages = defineMessages({
  addfilter: {
    id: 'filtereditor.addfilter',
    description: 'Button text for add filter',
    defaultMessage: 'Add filter'
  },
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

const logical = [
  {value: 'all', text: 'every filter matches'},
  {value: 'any', text: 'any filter matches'}
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
    initialExpression: React.PropTypes.array,
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
    var filters = [], logical = 'all';
    var expression = this.props.initialExpression;
    if (expression) {
      if (expression[0] === 'all' || expression[0] === 'any') {
        logical = expression[0];
        for (var i = 1, ii = expression.length; i < ii; i++) {
          filters.push({
            attribute: expression[i][1],
            operator: expression[i][0],
            value: expression[i][2]
          });
        }
      } else {
        filters.push({
          attribute: expression[1],
          operator: expression[0],
          value: expression[2]
        });
      }
    } else {
      filters.push({});
    }
    this.state = {
      logical: logical,
      filters: filters
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  _generateFilter() {
    var result = [this.state.logical];
    for (var i = 0, ii = this.state.filters.length; i < ii; ++i) {
      var filter = this.state.filters[i];
      if (filter.operator !== undefined && filter.attribute !== undefined && filter.value !== undefined) {
        result.push([
          filter.operator,
          filter.attribute,
          filter.value
        ]);
      }
    }
    return result;
  }
  _onChangeProperty(filter, evt, idx, value) {
    filter.attribute = value;
    this.forceUpdate();
    this.props.onChange({expression: this._generateFilter()});
  }
  _onChangeOperator(filter, evt, id, value) {
    filter.operator = value;
    this.forceUpdate();
    this.props.onChange({expression: this._generateFilter()});
  }
  _onChangeValue(filter, evt, value) {
    filter.value = value;
    this.forceUpdate();
    this.props.onChange({expression: this._generateFilter()});
  }
  _isEqualFilter(filterA, filterB) {
    return (filterA.attribute === filterB.attribute && filterA.operator === filterB.operator && filterA.value === filterB.value);
  }
  _onChangeLogical(evt, id, value) {
    var me = this;
    this.setState({
      logical: value
    }, function() {
      me.props.onChange({expression: me._generateFilter()});
    });
  }
  _onDelete(filter) {
    var idx;
    for (var i = 0, ii = this.state.filters.length; i < ii; i++) {
      if (this._isEqualFilter(this.state.filters[i], filter)) {
        idx = i;
        break;
      }
    }
    if (idx > -1) {
      this.state.filters.splice(idx, 1);
      this.forceUpdate();
      this.props.onChange({expression: this._generateFilter()});
    }
  }
  _addNewFilter() {
    this.state.filters.push({});
    this.forceUpdate();
  }
  render() {
    const listStyle = {
      padding: '0px 16px',
      marginLeft: 0
    };
    var attributeItems = [];
    var i, ii;
    for (i = 0, ii = this.props.attributes.length; i < ii; ++i) {
      var attribute = this.props.attributes[i];
      attributeItems.push(<MenuItem key={i + 1} value={attribute} primaryText={attribute} />);
    }
    var operatorItems = [];
    for (i = 0, ii = operators.length; i < ii; ++i) {
      operatorItems.push(<MenuItem key={i} value={operators[i]} primaryText={operators[i]} />);
    }
    var filterItems = [];
    this.state.filters.forEach(function(filter, idx) {
      filterItems.push(
        <ListItem key={idx} innerDivStyle={ listStyle } rightIcon={<ActionDelete onTouchTap={this._onDelete.bind(this, filter)} color={red500} />}>
          <SelectField style={{width: '40%', marginRight: '10px', verticalAlign: 'bottom'}} value={filter.attribute} onChange={this._onChangeProperty.bind(this, filter)}>
            {attributeItems}
          </SelectField>
          <SelectField style={{width: '10%', marginRight: '10px', verticalAlign: 'bottom'}} value={filter.operator} onChange={this._onChangeOperator.bind(this, filter)}>
            {operatorItems}
          </SelectField>
          <TextField style={{width: '40%'}} name={'filter-value-' + idx} defaultValue={filter.value} onChange={this._onChangeValue.bind(this, filter)} />
        </ListItem>
      );
    }, this);
    var logicalItems = [];
    logical.forEach(function(logicalItem, idx) {
      logicalItems.push(<MenuItem key={idx} value={logicalItem.value} primaryText={logicalItem.text} />);
    });
    const {formatMessage} = this.props.intl;
    // TODO multiple rows
    return (
      <Paper className='style-contentContainer' zDepth={0}>
        <Subheader className='style-listHeader'>{formatMessage(messages.filterlabel)}</Subheader>
        <list>
          <ListItem>
            <SelectField value={this.state.logical} onChange={this._onChangeLogical.bind(this)}>
              {logicalItems}
            </SelectField>
          </ListItem>
          {filterItems}
        </list>


        <ToolbarGroup style={{width: '100%', justifyContent: 'flex-end'}}>
          <Button buttonType='Flat' label={formatMessage(messages.addfilter)} onTouchTap={this._addNewFilter.bind(this)} />
        </ToolbarGroup>
      </Paper>
    );
  }
}

export default injectIntl(FilterEditor);
