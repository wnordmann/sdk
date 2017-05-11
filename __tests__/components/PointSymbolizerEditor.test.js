/* global describe, it */

import React from 'react';
import {assert} from 'chai';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import PointSymbolizerEditor from '../../src/components/PointSymbolizerEditor';
import TestUtils from 'react-addons-test-utils';

describe('PointSymbolizerEditor', function() {

  it('renders the point symbolizer editor', function() {
    const renderer = TestUtils.createRenderer();
    var onChange = function() {};
    var initialState = {};
    renderer.render(<PointSymbolizerEditor intl={intl} onChange={onChange} initialState={initialState}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component point-symbolizer-editor style-contentContainer';
    assert.equal(actual, expected);
  });

});
