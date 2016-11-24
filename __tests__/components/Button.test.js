/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import Button from '../../js/components/Button';

describe('Button', function() {

  it('button gets created', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Button label='My button' tooltip='foo' />
    ), container);
    var buttons = container.querySelectorAll('button');
    assert.equal(buttons.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
