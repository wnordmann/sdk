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
import Dialog from 'pui-react-modals';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LoginActions from '../actions/LoginActions.js';
import {BasicInput} from 'pui-react-inputs';
import UI from 'pui-react-buttons';
import Pui from 'pui-react-alerts';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  title: {
    id: 'loginmodal.title',
    description: 'Title for the modal Login dialog',
    defaultMessage: 'Login'
  },
  usernamelabel: {
    id: 'loginmodal.userlabel',
    description: 'Label for the username field',
    defaultMessage: 'Username'
  },
  passwordlabel: {
    id: 'loginmodal.passwordlabel',
    description: 'Label for the password field',
    defaultMessage: 'Password'
  },
  loginbutton: {
    id: 'loginmodal.loginbutton',
    description: 'Text for the login button',
    defaultMessage: 'Login'
  },
  errormsg: {
    id: 'loginmodal.errormsg',
    description: 'Error message to show the user when a login request fails',
    defaultMessage: 'Invalid credentials'
  }
});

/**
 * Modal window for login to GeoServer.
 */
@pureRender
class LoginModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this.state = {
      error: false
    };
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _doLogin() {
    LoginActions.login(document.getElementById('username').value, document.getElementById('password').value, this.failureCb, this);
  }
  failureCb() {
    this.setState({error: true});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg)}</Pui.ErrorAlert></div>);
    }
    return (
      <Dialog.BaseModal title={formatMessage(messages.title)} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <form onSubmit={this._onSubmit}>
            {error}
            <BasicInput label={formatMessage(messages.usernamelabel)} id='username' />
            <BasicInput label={formatMessage(messages.passwordlabel)} id='password' type='password' />
            <UI.DefaultButton onClick={this._doLogin.bind(this)}>{formatMessage(messages.loginbutton)}</UI.DefaultButton>
          </form>
        </Dialog.ModalBody>
      </Dialog.BaseModal>
    );
  }
}

LoginModal.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(LoginModal, {withRef: true});
