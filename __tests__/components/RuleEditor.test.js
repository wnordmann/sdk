/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import RuleEditor from '../../js/components/RuleEditor';

raf.polyfill();

describe('RuleEditor', function() {

  it('fires onChange', function() {
    var container = document.createElement('div');
    var onChange = function(state) {
      assert.equal(state.labelAttribute, null);
    };
    var attributes = ['foo', 'bar'];
    ReactDOM.render((
      <RuleEditor attributes={attributes} visible={true} onChange={onChange} intl={intl} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('does not fire onChange if visible is false', function() {
    var container = document.createElement('div');
    var called = false;
    var onChange = function(state) {
      called = true;
    };
    var attributes = ['foo', 'bar'];
    ReactDOM.render((
      <RuleEditor attributes={attributes} visible={false} onChange={onChange} intl={intl} />
    ), container);
    assert.equal(called, false);
    ReactDOM.unmountComponentAtNode(container);
  });

});
