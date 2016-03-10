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
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LoginModal from './LoginModal.jsx';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LoginConstants from '../constants/LoginConstants.js';
import LoginActions from '../actions/LoginActions.js';
import {doGET, doPOST} from '../util.js';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontext: {
    id: 'login.buttontext',
    description: 'Button text for login',
    defaultMessage: 'Login'
  },
  logouttext: {
    id: 'login.logouttext',
    description: 'Button text for log out',
    defaultMessage: 'Logout'
  }
});

/**
 * Login dialog for integration with GeoServer security.
 */
@pureRender
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LoginConstants.LOGIN:
          me._doLogin(action.user, action.pwd, action.failure, action.scope);
          break;
        default:
          break;
      }
    });
  }
  componentDidMount() {
    doGET(this._getURL(), function(xmlhttp) {
      var response = JSON.parse(xmlhttp.responseText);
      this.setState({user: response.user});
    }, function(xmlhttp) {
      if (xmlhttp['status'] === 401) {
        document.cookie = 'JSESSIONID=; path=/geoserver; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      this.setState({user: null});
    }, this);
  }
  _getURL() {
    return this.props.url + (this.props.url.slice(-1) === '/' ? '' : '/') + 'app/api/login';
  }
  _doLogin(user, pwd, failureCb, scope) {
    var url = this._getURL();
    var contentType = 'application/x-www-form-urlencoded';
    var data = 'username=' + user + '&password=' + pwd;
    var success = function(xmlhttp) {
      var response = JSON.parse(xmlhttp.responseText);
      document.cookie = 'JSESSIONID=' + response.session + '; path=/geoserver;';
      this.setState({user: user});
    };
    var failure = function(xmlhttp) {
      failureCb.call(scope);
      this.setState({user: null});
    };
    doPOST(url, data, success, failure, this, contentType);

  }
  _showLoginDialog() {
    this.refs.loginmodal.getWrappedInstance().open();
  }
  _doLogout() {
    document.cookie = 'JSESSIONID=; path=/geoserver; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    LoginActions.logout();
    this.setState({user: null});
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.state.user !== null) {
      return (
        <DD.Dropdown pullRight {...this.props} title={this.state.user}>
          <DD.DropdownItem onSelect={this._doLogout.bind(this)}>{formatMessage(messages.logouttext)}</DD.DropdownItem>
        </DD.Dropdown>
      );
    } else {
      return (
        <UI.DefaultButton onClick={this._showLoginDialog.bind(this)}>{formatMessage(messages.buttontext)}
          <LoginModal ref='loginmodal' />
        </UI.DefaultButton>
      );
    }
  }
}

Login.propTypes = {
  /**
   * Url to geoserver.
   */
  url: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Login.defaultProps = {
  url: '/geoserver/'
};

export default injectIntl(Login);
