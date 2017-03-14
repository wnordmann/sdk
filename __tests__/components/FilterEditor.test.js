/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import intl from '../mock-i18n';
import FilterEditor from '../../src/components/FilterEditor';
import {assert} from 'chai';

describe('FilterEditor', function() {

  it('renders correctly', function() {
    var container = document.createElement('div');
    var onChange = function(result) {
    };
    var expr = [
      'all',
      ['<=', 'foo', 20],
      ['>=', 'foo', 10]
    ];
    var editor = ReactDOM.render((
      <FilterEditor initialExpression={expr} attributes={['foo']} onChange={onChange} intl={intl} />
    ), container);
    assert.equal(editor.state.filters.length, 2);
    assert.equal(editor.state.logical, 'all');
    ReactDOM.unmountComponentAtNode(container);
  });

});
