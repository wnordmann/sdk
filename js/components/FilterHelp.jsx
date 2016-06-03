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
import Popover from 'material-ui/lib/popover/popover';
import HelpOutline from 'material-ui/lib/svg-icons/action/help-outline';
import './FilterHelp.css';

class FilterHelp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {help: false};
  }
  componentDidMount() {
    this.helpElement = ReactDOM.findDOMNode(this.refs.help);
  }
  _onToggleHelp() {
    this.setState({help:!this.state.help});
  }
  render() {
    const monoStyle = {'fontWeight':'bold', 'color':'#424242', 'display':'inline-block', 'minWidth':'80px'};
    const popStyle = {'padding':'12px','margin':'36px','maxWidth':'600px'};
    return (
      <span className='filter-help' style={this.props.style}>
        <HelpOutline ref='help' onClick={this._onToggleHelp.bind(this)}/>
        <Popover open={this.state.help} onRequestClose={this._onToggleHelp.bind(this)} style={popStyle} anchorEl={this.helpElement} anchorOrigin={{'horizontal':'left'}}>
          <p>
            Type in a string to search all feature attributes, or a filter expression to narrow your search to one or more attributes.
          </p>
          <p>
            Examples:
          </p>
          <ul>
            <li><div style={monoStyle}>population &gt; 100000 </div><br/>All features with a population greater than 100000</li>
            <li><div style={monoStyle}>sovereignt == "United Kingdom" and not (subregion like "Europe")</div><br/>All british colonies not in Europe</li>
          </ul>
          <p>
            Expressions may contain attribute names, strings, numbers, and operators.
            Attribute names may be surrounded  by single quotes (') to reduce ambiguity.
            Strings must be surrounded by double quotes (").
            Numbers and operators are unquoted.
          </p>
          <p>
            Supported operators are:
          </p>
          <ul>
            <li><div style={monoStyle}>a == a</div> a exactly equals b</li>
            <li><div style={monoStyle}>a != a</div> a does not equal b</li>
            <li><div style={monoStyle}>a &lt; a</div> a is less than b</li>
            <li><div style={monoStyle}>a &lt;= b</div> a is less than or equal to b</li>
            <li><div style={monoStyle}>a &gt; b</div> a is greater than b</li>
            <li><div style={monoStyle}>a &gt;= b</div> a is greater than or equal to b</li>
            <li><div style={monoStyle}>a like b</div> b contains a (case insensitive)</li>
            <li><div style={monoStyle}>a in (x,y,z)</div> a is equal to one or more values in the list x,y,z</li>
            <li><div style={monoStyle}>e and f</div> Matches both expressions e and f</li>
            <li><div style={monoStyle}>e or f</div> Matches either expression e or f</li>
            <li><div style={monoStyle}>not e</div> Returns all results that do not match the expression e</li>
          </ul>
          <p>
            Any expression may be surrounded by parentheses for clarity (e.g. when combining ands and ors).
          </p>
        </Popover>
      </span>
    );
  }
}

FilterHelp.propTypes = {
  /**
   * Style for the root span.
   */
  style: React.PropTypes.object
};

export default FilterHelp;
