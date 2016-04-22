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
import Tab from 'material-ui/lib/tabs/tab';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import LabelEditor from './LabelEditor.jsx';
import StrokeEditor from './StrokeEditor.jsx';
import FillEditor from './FillEditor.jsx';
import FilterEditor from './FilterEditor.jsx';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
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
    this.state = {
      value: 1
    };
  }
  handleChange(value) {
    if (value === parseInt(value, 10)) {
      this.setState({
        value: value,
      });
    }
  }
  render() {
    if (this.props.visible) {
      const {formatMessage} = this.props.intl;
      return (
        <Tabs value={this.state.value} onChange={this.handleChange.bind(this)}>
          <Tab value={1} label={formatMessage(messages.filltitle)}>
            <FillEditor {...this.props} />
          </Tab>
          <Tab value={2} label={formatMessage(messages.stroketitle)}>
            <StrokeEditor {...this.props} />
          </Tab>
          <Tab value={3} label={formatMessage(messages.labeltitle)}>
            <LabelEditor {...this.props} />
          </Tab>
          <Tab value={4} label={formatMessage(messages.filtertitle)}>
            <FilterEditor {...this.props} />
          </Tab>
        </Tabs>
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
