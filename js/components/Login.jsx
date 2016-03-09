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
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LoginModal from './LoginModal.jsx';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontext: {
    id: 'login.buttontext',
    description: 'Button text for login',
    defaultMessage: 'Login'
  }
});

/**
 * Login dialog for integration with GeoServer securiry.
 */
@pureRender
class Login extends React.Component {
  _doLogin() {
    this.refs.loginmodal.getWrappedInstance().open();
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.DefaultButton onClick={this._doLogin.bind(this)}>{formatMessage(messages.buttontext)}
        <LoginModal ref='loginmodal' />
      </UI.DefaultButton>
    );
  }
}

Login.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Login);
