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
import UI from 'pui-react-buttons';
import DD from 'pui-react-dropdowns';
import Icon from 'pui-react-iconography';
import Responsive from 'react-responsive-decorator';
import pureRender from 'pure-render-decorator';
import './Toolbar.css';
/**
 * Adds the ability to show a toolbar with buttons. On small screen sizes
 * a dropdown will be shown instead.
 *
 * ```javascript
 * var options = [{
 *   jsx: (<Login />)
 * }, {
 *   jsx: (<ImageExport map={map} />)
 * }, {
 *   jsx: (<Measure toggleGroup='navigation' map={map}/>)
 * }, {
 *   jsx: (<AddLayer map={map} />)
 * }, {
 *   jsx: (<QGISPrint map={map} layouts={printLayouts} />)
 * }, {
 *   jsx: (<Select toggleGroup='navigation' map={map}/>)
 * }, {
 *   text: formatMessage(messages.navigationbutton),
 *   title: formatMessage(messages.navigationbuttontitle),
 *   onClick: this._navigationFunc.bind(this),
 *   icon: 'hand-paper-o'
 * }];
 * ```
 *
 * ```xml
 * <Toolbar options={options} />
 * ```
 */
@Responsive
@pureRender
class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: false
    };
  }
  componentDidMount() {
    this.props.media({minWidth: this.props.width}, () => {
      this.setState({
        isMobile: false
      });
    });
    this.props.media({maxWidth: this.props.width}, () => {
      this.setState({
        isMobile: true
      });
    });
  }
  render() {
    const {isMobile} = this.state;
    if (isMobile) {
      var nonTextItems = [];
      var items = [];
      for (var i = 0, ii = this.props.options.length; i < ii; ++i) {
        var option = this.props.options[i];
        if (option.jsx) {
          if (option.exclude) {
            nonTextItems.push(option.jsx);
          } else {
            items.push(option.jsx);
          }
        } else {
          var icon = option.icon ? (<Icon.Icon name={option.icon} />) : undefined;
          items.push(<DD.DropdownItem key={i} onSelect={option.onClick}>{icon} {option.text}</DD.DropdownItem>);
        }
      }
      var dropdown;
      if (items.length > 0) {
        dropdown = (
          <DD.Dropdown title='=' className='pull-right'>
            {items}
          </DD.Dropdown>
        );
      }
      return (
        <nav role='navigation'>
          <div className='toolbar'>
            {dropdown}
            {nonTextItems}
          </div>
        </nav>
      );
    } else {
      var buttons = this.props.options.map(function(option, idx) {
        if (option.jsx) {
          return (<ul className={option.pullRight === false ? '' : 'pull-right'} key={idx}>{option.jsx}</ul>);
        } else {
          var icon = option.icon ? (<Icon.Icon name={option.icon} />) : undefined;
          return (<ul className={option.pullRight === false ? '' : 'pull-right'} key={idx}><UI.DefaultButton onClick={option.onClick} title={option.title}>{icon} {option.text}</UI.DefaultButton></ul>);
        }
      });
      return (
        <nav role='navigation'>
          <div className='toolbar'>
            {buttons}
          </div>
        </nav>
      );
    }
  }
}

Toolbar.propTypes = {
  /**
   * The options to show in the toolbar. An array of objects with jsx (element), icon (string), text (string),
   * title (string), pullRight (boolean) and onClick (function) keys.
   * When using jsx, use exclude to not have the item show up in the menu on small screens,
   * but separate in the toolbar.
   */
  options: React.PropTypes.arrayOf(React.PropTypes.shape({
    jsx: React.PropTypes.element,
    exclude: React.PropTypes.bool,
    icon: React.PropTypes.string,
    text: React.PropTypes.string,
    title: React.PropTypes.string,
    onClick: React.PropTypes.func,
    pullRight: React.PropTypes.bool
  })).isRequired,
  /**
   * Handled automatically by the responsive decorator.
   */
  media: React.PropTypes.func,
  /**
   * Width in pixels below which mobile layout should kick in.
   */
  width: React.PropTypes.number
};

Toolbar.defaultProps = {
  width: 1024
};

export default Toolbar;
