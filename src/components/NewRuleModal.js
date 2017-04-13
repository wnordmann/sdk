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
import Dialog from './Dialog';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import TextField from 'material-ui/TextField';
import Button from './Button';

const messages = defineMessages({
  closebutton: {
    id: 'newrulemodal.closebutton',
    description: 'Text for the close button',
    defaultMessage: 'Close'
  },
  addrulebutton: {
    id: 'newrulemodal.addrulebutton',
    description: 'Text for the add rule button',
    defaultMessage: 'ADD'
  },
  dialogtitle: {
    id: 'newrulemodal.dialogtitle',
    description: 'Title for the dialog',
    defaultMessage: 'Add New Rule'
  },
  rulelabel: {
    id: 'newrulemodal.rulelabel',
    description: 'Label for the new rule input field',
    defaultMessage: 'Rule:'
  }
});

class NewRuleModal extends React.PureComponent {
  static propTypes = {
    /**
     * Callback function when new rule gets added, gets rule name as argument.
     */
    onAdd: React.PropTypes.func.isRequired,
    /**
     * Callback function to close dialog.
     */
    onRequestClose: React.PropTypes.func.isRequired,
    /**
     * Should we show inline or as a modal dialog?
     */
    inline: React.PropTypes.bool,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      rulename: ''
    };
  }
  componentWillReceiveProps() {
    this.setState({
      rulename: ''
    });
  }
  onChange() {
    this.setState({
      rulename: this.refs.name.getValue()
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var actions = [
      <Button buttonType='Flat' primary={true} label={formatMessage(messages.addrulebutton)} onTouchTap={this.props.onAdd.bind(this, this.state.rulename)} />
    ];
    return (
      <Dialog inline={this.props.inline} actions={actions} autoScrollBodyContent={true} modal={true} title={formatMessage(messages.dialogtitle)} open={this.props.open} onRequestClose={this.props.onRequestClose}>
        <TextField value={this.state.rulename} onChange={this.onChange.bind(this)} fullWidth={true} ref='name' floatingLabelText={formatMessage(messages.rulelabel)} />
      </Dialog>
    );
  }
}

export default injectIntl(NewRuleModal);
