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
import Dialog from 'material-ui/lib/dialog';
import classNames from 'classnames';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LoginActions from '../actions/LoginActions.js';
import Snackbar from 'material-ui/lib/snackbar';
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
  closebutton: {
    id: 'loginmodal.closebutton',
    description: 'Text for the close button',
    defaultMessage: 'Close'
  },
  invalidcredentialsmsg: {
    id: 'loginmodal.invalidcredentialsmsg',
    description: 'Error message to show the user when a login request fails',
    defaultMessage: 'Invalid credentials'
  },
  errormsg: {
    id: 'loginmodal.errormsg',
    description: 'Error message to show if communication with GeoServer fails',
    defaultMessage: 'There was an error communicating with GeoServer, details: {details}'
  }
});

/**
 * Modal window for login to GeoServer.
 */
@pureRender
class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      errorOpen: false,
      open: false
    };
  }
  _onEnter(evt) {
    if (evt.keyCode === 13) {
      this._doLogin();
    }
  }
  _doLogin() {
    var username = this.refs.username.getValue();
    var pwd = this.refs.password.getValue();
    LoginActions.login(username, pwd, this.failureCb, this);
  }
  failureCb(xmlhttp) {
    const {formatMessage} = this.props.intl;
    var msg;
    if (xmlhttp.status === 401) {
      msg = formatMessage(messages.invalidcredentialsmsg);
    } else {
      msg = formatMessage(messages.errormsg, {details: xmlhttp.status + ' ' + xmlhttp.statusText});
    }
    this.setState({errorOpen: true, error: true, errorMsg: msg});
  }
  open() {
    this.setState({open: true});
  }
  close() {
    this.setState({open: false});
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  render() {
    const {formatMessage} = this.props.intl;
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        style={{transitionProperty : 'none'}}
        open={this.state.errorOpen}
        message={this.state.errorMsg}
        autoHideDuration={2000}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var actions = [
      <RaisedButton style={{margin: '10px 12px'}} secondary={true} label={formatMessage(messages.loginbutton)} onTouchTap={this._doLogin.bind(this)} />,
      <RaisedButton style={{margin: '10px 12px'}} label={formatMessage(messages.closebutton)} onTouchTap={this.close.bind(this)} />
    ];
    return (
      <Dialog className={classNames('sdk-component login-modal', this.props.className)} actions={actions} title={formatMessage(messages.title)} open={this.state.open} onRequestClose={this.close.bind(this)}>
        {error}
        <TextField style={{width: '512px'}} floatingLabelText={formatMessage(messages.usernamelabel)} ref='username' /><br/>
        <TextField style={{width: '512px'}} onKeyDown={this._onEnter.bind(this)} type="password" floatingLabelText={formatMessage(messages.passwordlabel)} ref='password' />
      </Dialog>
    );
  }
}

LoginModal.propTypes = {
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(LoginModal, {withRef: true});
