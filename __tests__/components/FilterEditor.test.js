/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import FilterEditor from '../../js/components/FilterEditor';

raf.polyfill();

describe('FilterEditor', function() {

  it('renders correctly', function() {
    var container = document.createElement('div');
    var onChange = function(result) {
    };
    var editor = ReactDOM.render((
      <FilterEditor onChange={onChange} intl={intl} />
    ), container);
    editor._setQueryFilter({target: {value: 'foo = "bar"'}});
    assert.equal(editor.state.hasError, true);
    editor._setQueryFilter({target: {value: 'foo == "bar"'}});
    assert.equal(editor.state.hasError, false);
    ReactDOM.unmountComponentAtNode(container);
  });

});
