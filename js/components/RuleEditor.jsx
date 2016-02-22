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
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import UI from 'pui-react-tabs';
import LabelEditor from './LabelEditor.jsx';
import StrokeEditor from './StrokeEditor.jsx';
import FillEditor from './FillEditor.jsx';
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
  }
});

@pureRender
class RuleEditor extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.SimpleTabs defaultActiveKey={1}>
        <UI.Tab eventKey={1} title={formatMessage(messages.filltitle)}>
          <FillEditor {...this.props} />
        </UI.Tab>
        <UI.Tab eventKey={2} title={formatMessage(messages.stroketitle)}>
          <StrokeEditor {...this.props} />
        </UI.Tab>
        <UI.Tab eventKey={3} title={formatMessage(messages.labeltitle)}>
          <LabelEditor {...this.props} />
        </UI.Tab>
      </UI.SimpleTabs>
    );
  }
}

RuleEditor.propTypes = {
  /**
   * List of attributes.
   */
  attributes: React.PropTypes.array,
  /**
   * Callback that is called when a change is made.
   */
  onChange: React.PropTypes.func.isRequired,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired
};

export default injectIntl(RuleEditor);
