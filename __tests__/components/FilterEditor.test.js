/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import intl from '../mock-i18n';
import FilterEditor from '../../js/components/FilterEditor';

describe('FilterEditor', function() {

  it('renders correctly', function() {
    var container = document.createElement('div');
    var onChange = function(result) {
    };
    ReactDOM.render((
      <FilterEditor attributes={['foo']} onChange={onChange} intl={intl} />
    ), container);
    ReactDOM.unmountComponentAtNode(container);
  });

});
