/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import LoginModal from '../../src/components/LoginModal';

describe('LoginModal', function() {

  it('inputs for user and password generated', function(done) {
    var container = document.createElement('div');
    ReactDOM.render((
      <LoginModal open={true} intl={intl} />
    ), container);
    var inputs = document.querySelectorAll('input');
    assert.equal(inputs.length, 2);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
