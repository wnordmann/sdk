/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import TestUtils from 'react-addons-test-utils';
import Navigation from '../../src/components/Navigation';

describe('Navigation', function() {

  it('click triggers the secondary state', function() {
    var container = document.createElement('div');
    var nav = ReactDOM.render((
      <Navigation toggleGroup='navigation' intl={intl} />
    ), container);
    var button = container.querySelector('button');
    assert.equal(nav.state.secondary, false);
    TestUtils.Simulate.touchTap(button);
    assert.equal(nav.state.secondary, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
