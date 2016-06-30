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
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import Popover from 'material-ui/lib/popover/popover';
import HelpOutline from 'material-ui/lib/svg-icons/action/help-outline';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './FilterHelp.css';

const messages = defineMessages({
  introtextprefix: {
    id: 'filterhelp.introtextprefix',
    description: 'Intro text for the filter help dialog',
    defaultMessage: 'Type in'
  },
  introtextstringsearch: {
    id: 'filterhelp.introtextstringsearch',
    description: 'Text to show if string text is available',
    defaultMessage: 'a string to search all feature attributes, or'
  },
  introtextsuffix: {
    id: 'filterhelp.introtextsuffix',
    description: 'Last part of the intro text',
    defaultMessage: 'a filter expression to narrow your search to one or more attributes.'
  },
  exampletext: {
    id: 'filterhelp.exampletext',
    description: 'Example text',
    defaultMessage: 'Examples:'
  },
  example1filter: {
    id: 'filterhelp.example1filter',
    description: 'First example filter text',
    defaultMessage: 'population > 100000'
  },
  example1description: {
    id: 'filterhelp.example1description',
    description: 'First example filter description',
    defaultMessage: 'All features with a population greater than 100000'
  },
  example2filter: {
    id: 'filterhelp.example2filter',
    description: 'Second example filter text',
    defaultMessage: 'sovereignt == "United Kingdom" and not (subregion like "Europe")'
  },
  example2description: {
    id: 'filterhelp.example2description',
    description: 'Second example filter description',
    defaultMessage: 'All british colonies not in Europe'
  },
  generalsection: {
    id: 'filterhelp.generalsection',
    description: 'General section text',
    defaultMessage: 'Expressions may contain attribute names, strings, numbers, and operators. Attribute names may be surrounded  by single quotes (\') to reduce ambiguity. Strings must be surrounded by double quotes ("). Numbers and operators are unquoted.'
  },
  operatortext: {
    id: 'filterhelp.operatortext',
    description: 'Help text for operators',
    defaultMessage: 'Supported operators are:'
  },
  operator1: {
    id: 'filterhelp.operator1',
    description: 'First example of an operator',
    defaultMessage: 'a == a'
  },
  operator1description: {
    id: 'filterhelp.operator1description',
    description: 'Desscription for first operator',
    defaultMessage: 'a exactly equals b'
  },
  operator2: {
    id: 'filterhelp.operator2',
    description: 'Second example of an operator',
    defaultMessage: 'a != a'
  },
  operator2description: {
    id: 'filterhelp.operator2description',
    description: 'Desscription for second operator',
    defaultMessage: 'a does not equal b'
  },
  operator3: {
    id: 'filterhelp.operator3',
    description: 'Third example of an operator',
    defaultMessage: 'a < a'
  },
  operator3description: {
    id: 'filterhelp.operator3description',
    description: 'Desscription for third operator',
    defaultMessage: 'a is less than b'
  },
  operator4: {
    id: 'filterhelp.operator4',
    description: 'Fourth example of an operator',
    defaultMessage: 'a <= b'
  },
  operator4description: {
    id: 'filterhelp.operator4description',
    description: 'Desscription for fourth operator',
    defaultMessage: 'a is less than or equal to b'
  },
  operator5: {
    id: 'filterhelp.operator5',
    description: 'Fifth example of an operator',
    defaultMessage: 'a > b'
  },
  operator5description: {
    id: 'filterhelp.operator5description',
    description: 'Desscription for fifth operator',
    defaultMessage: 'a is greater than b'
  },
  operator6: {
    id: 'filterhelp.operator6',
    description: 'Sixth example of an operator',
    defaultMessage: 'a >= b'
  },
  operator6description: {
    id: 'filterhelp.operator6description',
    description: 'Desscription for sixth operator',
    defaultMessage: 'a is greater than or equal to b'
  },
  operator7: {
    id: 'filterhelp.operator7',
    description: 'Seventh example of an operator',
    defaultMessage: 'a like b'
  },
  operator7description: {
    id: 'filterhelp.operator7description',
    description: 'Desscription for seventh operator',
    defaultMessage: 'b contains a (case insensitive)'
  },
  operator8: {
    id: 'filterhelp.operator8',
    description: 'Eigth example of an operator',
    defaultMessage: 'a in (x,y,z)'
  },
  operator8description: {
    id: 'filterhelp.operator8description',
    description: 'Desscription for eigth operator',
    defaultMessage: 'a is equal to one or more values in the list x,y,z'
  },
  operator9: {
    id: 'filterhelp.operator9',
    description: 'Nineth example of an operator',
    defaultMessage: 'e and f'
  },
  operator9description: {
    id: 'filterhelp.operator9description',
    description: 'Desscription for nineth operator',
    defaultMessage: 'Matches both expressions e and f'
  },
  operator10: {
    id: 'filterhelp.operator10',
    description: 'Tenth example of an operator',
    defaultMessage: 'e or f'
  },
  operator10description: {
    id: 'filterhelp.operator10description',
    description: 'Desscription for tenth operator',
    defaultMessage: 'Matches either expression e or f'
  },
  operator11: {
    id: 'filterhelp.operator11',
    description: 'Eleventh example of an operator',
    defaultMessage: 'not e'
  },
  operator11description: {
    id: 'filterhelp.operator11description',
    description: 'Desscription for eleventh operator',
    defaultMessage: 'Returns all results that do not match the expression e'
  },
  parantheses: {
    id: 'filterhelp.parantheses',
    description: 'Help text for parentheses',
    defaultMessage: 'Any expression may be surrounded by parentheses for clarity (e.g. when combining ands and ors).'
  }
});

/**
 * Help dialog for filter fields.
 */
class FilterHelp extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      help: false,
      muiTheme: context.muiTheme || ThemeManager.getMuiTheme()
    };
  }
  componentDidMount() {
    this.helpElement = ReactDOM.findDOMNode(this.refs.help);
  }
  _onToggleHelp() {
    this.setState({help: !this.state.help});
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: Object.assign(this.props.style, {
        color: rawTheme.palette.textColor
      }),
      mono: Object.assign(this.props.monoStyle, {
        color: rawTheme.palette.textColor
      })
    };
  }
  render() {
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    var introText = formatMessage(messages.introtextprefix) + ' ';
    if (this.props.textSearch) {
      introText += formatMessage(messages.introtextstringsearch) + ' ';
    }
    introText += formatMessage(messages.introtextsuffix);
    return (
      <span className='filter-help' style={this.props.style}>
        <HelpOutline ref='help' onClick={this._onToggleHelp.bind(this)}/>
        <Popover open={this.state.help} onRequestClose={this._onToggleHelp.bind(this)} style={styles.root} anchorEl={this.helpElement} anchorOrigin={{'horizontal':'left'}}>
          <p>
            {introText}
          </p>
          <p>
            {formatMessage(messages.exampletext)}
          </p>
          <ul>
            <li><div style={styles.mono}>{formatMessage(messages.example1filter)}</div><br/>{formatMessage(messages.example1description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.example2filter)}</div><br/>{formatMessage(messages.example2description)}</li>
          </ul>
          <p>
            {formatMessage(messages.generalsection)}
          </p>
          <p>
            {formatMessage(messages.operatortext)}
          </p>
          <ul>
            <li><div style={styles.mono}>{formatMessage(messages.operator1)}</div>{formatMessage(messages.operator1description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator2)}</div>{formatMessage(messages.operator2description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator3)}</div>{formatMessage(messages.operator3description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator4)}</div>{formatMessage(messages.operator4description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator5)}</div>{formatMessage(messages.operator5description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator6)}</div>{formatMessage(messages.operator6description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator7)}</div>{formatMessage(messages.operator7description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator8)}</div>{formatMessage(messages.operator8description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator9)}</div>{formatMessage(messages.operator9description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator10)}</div>{formatMessage(messages.operator10description)}</li>
            <li><div style={styles.mono}>{formatMessage(messages.operator11)}</div>{formatMessage(messages.operator11description)}</li>
          </ul>
          <p>
            {formatMessage(messages.parantheses)}
          </p>
        </Popover>
      </span>
    );
  }
}

FilterHelp.propTypes = {
  /**
   * Can we search through all attributes or not?
   */
  textSearch: React.PropTypes.bool,
  /**
   * Style config.
   */
  style: React.PropTypes.object,
  /**
   * Mono style config.
   */
  monoStyle: React.PropTypes.object,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

FilterHelp.defaultProps = {
  textSearch: false,
  style: {
    padding: '12px',
    margin: '36px',
    maxWidth: '600px'
  },
  monoStyle: {
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '80px'
  }
};

FilterHelp.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(FilterHelp);
