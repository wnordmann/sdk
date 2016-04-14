import LoginActions from '../actions/LoginActions.js';
import {doGET, doPOST} from '../util.js';

class AuthService {
  login(url, user, pwd, onSuccess, onFailure) {
    var contentType = 'application/x-www-form-urlencoded';
    var data = 'username=' + user + '&password=' + pwd;
    var success = function(xmlhttp) {
      var response = JSON.parse(xmlhttp.responseText);
      document.cookie = 'JSESSIONID=' + response.session + '; path=/geoserver;';
      onSuccess.call();
    };
    var failure = function(xmlhttp) {
      onFailure.call();
    };
    doPOST(url, data, success, failure, this, contentType);
  }
  logoff() {
    document.cookie = 'JSESSIONID=; path=/geoserver; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    LoginActions.logout();
  }
  getStatus(url, onSuccess, onFailure) {
    var success = function(xmlhttp) {
      var response = JSON.parse(xmlhttp.responseText);
      onSuccess.call(this, response.user);
    };
    var failure = function(xmlhttp) {
      if (xmlhttp.status === 401) {
        this.logoff();
      }
      onFailure.call();
    };
    return doGET(url, success, failure, this);
  }
}

export default new AuthService();
