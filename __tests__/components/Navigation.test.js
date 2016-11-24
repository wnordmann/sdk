/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import TestUtils from 'react-addons-test-utils';
import Navigation from '../../js/components/Navigation';

var tapDataInjector = function(x, y) {
  return {
    touches: [{
      pageX: x,
      pageY: y,
      clientX: x,
      clientY: y
    }]
  };
};

describe('Navigation', function() {

  it('click triggers the secondary state', function() {
    var container = document.createElement('div');
    var nav = ReactDOM.render((
      <Navigation toggleGroup='navigation' intl={intl} />
    ), container);
    var button = container.querySelector('button');
    assert.equal(nav.state.secondary, false);
    TestUtils.SimulateNative.touchStart(button, tapDataInjector(0, 0));
    TestUtils.SimulateNative.touchEnd(button, tapDataInjector(0, 0));
    assert.equal(nav.state.secondary, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
