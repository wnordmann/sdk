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
import ol from 'openlayers';
import ColorPicker from 'react-color';
import {transformColor} from '../util.js';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import UI from 'pui-react-tabs';
import LabelEditor from './LabelEditor.jsx';
import StrokeEditor from './StrokeEditor.jsx';
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
    this.state = {
      fillColor: [255, 0, 0, 0.5]
    };
  }
  _onChangeFill(color) {
    this.state.fillColor = transformColor(color);
    this.props.onChange(this.state);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.SimpleTabs defaultActiveKey={1}>
        <UI.Tab eventKey={1} title={formatMessage(messages.filltitle)}>
          <ColorPicker onChangeComplete={this._onChangeFill.bind(this)} color={this.state.fillColor} />
        </UI.Tab>
        <UI.Tab eventKey={2} title={formatMessage(messages.stroketitle)}>
          <StrokeEditor layer={this.props.layer} onChange={this.props.onChange} />
        </UI.Tab>
        <UI.Tab eventKey={3} title={formatMessage(messages.labeltitle)}>
          <LabelEditor layer={this.props.layer} onChange={this.props.onChange} attributes={this.props.attributes} />
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
   * The layer associated with this rule editor.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
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
