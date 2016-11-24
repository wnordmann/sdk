/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import Geocoding from '../../js/components/Geocoding';

describe('Geocoding', function() {

  it('renders the search input field', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Geocoding intl={intl} />
    ), container);
    var inputs = container.querySelectorAll('input');
    assert(inputs.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});
