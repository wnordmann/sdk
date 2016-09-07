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
import Tabs from 'material-ui/lib/tabs/tabs';
import classNames from 'classnames';
import Tab from 'material-ui/lib/tabs/tab';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import LabelEditor from './LabelEditor.jsx';
import Paper from 'material-ui/lib/paper';
import StrokeEditor from './StrokeEditor.jsx';
import FillEditor from './FillEditor.jsx';
import FilterEditor from './FilterEditor.jsx';
import TextField from 'material-ui/lib/text-field';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  titlelabel: {
    id: 'ruleeditor.titlelabel',
    description: 'Label for the title text field',
    defaultMessage: 'Title'
  },
  filltitle: {
    id: 'ruleeditor.filltitle',
    description: 'Title for the fill tab',
    defaultMessage: 'Fill'
  },
  stroketitle: {
    id: 'ruleeditor.stroketitle',
    description: 'Title for the stroke tab',
    defaultMessage: 'Stroke'
  },
  labeltitle: {
    id: 'ruleeditor.labeltitle',
    description: 'Title for the label tab',
    defaultMessage: 'Label'
  },
  filtertitle: {
    id: 'ruleeditor.filtertitle',
    description: 'Title for the filter tab',
    defaultMessage: 'Filter'
  }
});

/**
 * Editor for a style rule. This means editing symbolizer properties and filter.
 */
@pureRender
class RuleEditor extends React.Component {
  constructor(props) {
    super(props);
    var title = this.props.initialState ? this.props.initialState.title : undefined;
    this.state = {
      value: props.geometryType === 'Polygon' ? 1 : 2,
      title: title
    };
  }
  handleChange(value) {
    if (value === parseInt(value, 10)) {
      this.setState({
        value: value
      });
    }
  }
  _onTitleChange() {
    var title = this.refs.title.getValue();
    this.setState({title: title});
    this.props.onChange({
      title: title
    });
  }
  _getTabs() {
    const {formatMessage} = this.props.intl;
    var tabs = [];
    if (this.props.geometryType === 'Polygon' || this.props.geometryType === 'Point') {
      tabs.push(
        <Tab key='fill' value={1} label={formatMessage(messages.filltitle)} disableTouchRipple={true}>
          <FillEditor intl={this.props.intl} onChange={this.props.onChange} initialFillColor={this.props.initialState ? this.props.initialState.fillColor : undefined} />
        </Tab>
      );
    }
    tabs.push((<Tab key='stroke' value={2} label={formatMessage(messages.stroketitle)} disableTouchRipple={true}>
         <StrokeEditor intl={this.props.intl} onChange={this.props.onChange} initialStrokeWidth={this.props.initialState ? this.props.initialState.strokeWidth : undefined} initialStrokeColor={this.props.initialState ? this.props.initialState.strokeColor : undefined}  />
       </Tab>),
      (<Tab key='label' value={3} label={formatMessage(messages.labeltitle)} disableTouchRipple={true}>
         <LabelEditor attributes={this.props.attributes} intl={this.props.intl} onChange={this.props.onChange} initialFontColor={this.props.initialState ? this.props.initialState.fontColor : undefined} initialFontSize={this.props.initialState ? this.props.initialState.fontSize : undefined} initialLabelAttribute={this.props.initialState ? this.props.initialState.labelAttribute : undefined} />
       </Tab>),
      (<Tab key='filter' value={4} label={formatMessage(messages.filtertitle)} disableTouchRipple={true}>
         <FilterEditor intl={this.props.intl} onChange={this.props.onChange} initialExpression={this.props.initialState ? this.props.initialState.expression : undefined} />
       </Tab>)
    );
    return tabs;
  }
  render() {
    if (this.props.visible) {
      const {formatMessage} = this.props.intl;
      var tabs = this._getTabs();
      return (
        <Paper className={classNames('sdk-component rule-editor', this.props.className)} zIndex={2}>
          <TextField value={this.state.title} ref='title' onChange={this._onTitleChange.bind(this)} floatingLabelText={formatMessage(messages.titlelabel)} />
          <Tabs value={this.state.value} onChange={this.handleChange.bind(this)}>
            {tabs}
          </Tabs>
        </Paper>
      );
    } else {
      return (<article />);
    }
  }
}

RuleEditor.propTypes = {
  /**
   * Are we visible or not?
   */
  visible: React.PropTypes.bool,
  /**
   * List of attributes.
   */
  attributes: React.PropTypes.array,
  /**
   * Initial state.
   */
  initialState: React.PropTypes.object,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
   * The geometry type.
   */
  geometryType: React.PropTypes.oneOf(['Polygon', 'LineString', 'Point']),
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(RuleEditor);
