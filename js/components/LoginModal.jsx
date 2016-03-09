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
import {defineMessages, injectIntl} from 'react-intl';
import {doPOST} from '../util.js';
import {BasicInput} from 'pui-react-inputs';
import UI from 'pui-react-buttons';
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
  }
});

/**
 * Modal window for login to GeoServer.
 */
@pureRender
class LoginModal extends Dialog.Modal {
  constructor(props) {
    super(props);
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _doLogin() {
    var url = '/geoserver/app/api/login';
    var contentType = 'application/x-www-form-urlencoded';
    var data = 'username=' + document.getElementById('username').value + '&password=' + document.getElementById('password').value;
    var success = function(xmlhttp) {
      var response = JSON.parse(xmlhttp.responseText);
      document.cookie = 'JSESSIONID=' + response.session;
    };
    var failure = function(xmlhttp) {
    };
    doPOST(url, data, success, failure, this, contentType);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <Dialog.BaseModal title={formatMessage(messages.title)} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <form onSubmit={this._onSubmit} role='form'>
            <BasicInput label={formatMessage(messages.usernamelabel)} id='username' />
            <BasicInput label={formatMessage(messages.passwordlabel)} id='password' type='password' />
            <UI.DefaultButton onClick={this._doLogin.bind(this)}>{formatMessage(messages.loginbutton)}</UI.DefaultButton>
          </form>
        </Dialog.ModalBody>
      </Dialog.BaseModal>
    );
  }
}

export default injectIntl(LoginModal, {withRef: true});
