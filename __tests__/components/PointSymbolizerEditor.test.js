/* global describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import PointSymbolizerEditor from '../../src/components/PointSymbolizerEditor';
import TestUtils from 'react-addons-test-utils';

describe('PointSymbolizerEditor', function() {

  var onChange = function() {};
  var initialState = {};

  it('renders the point symbolizer editor', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<PointSymbolizerEditor intl={intl} onChange={onChange} initialState={initialState}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component point-symbolizer-editor style-contentContainer';
    assert.equal(actual, expected);
  });

  it('sets state when no initialState prop is defined', function() {
    var container = document.createElement('div');
    var component = ReactDOM.render((
      <PointSymbolizerEditor intl={intl} onChange={onChange}/>
    ), container);
    const actual = component.state;
    const expected = {
      symbolType: 'circle',
      symbolSize: '4',
      rotation: '0',
      externalGraphic: undefined,
      opacity: undefined
    };
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets state when initialState prop is null', function() {
    var container = document.createElement('div');
    var component = ReactDOM.render((
      <PointSymbolizerEditor intl={intl} onChange={onChange} initialState={initialState}/>
    ), container);
    const actual = component.state;
    const expected = {
      symbolType: 'circle',
      symbolSize: '4',
      rotation: '0',
      externalGraphic: undefined,
      opacity: undefined
    };
    assert.deepEqual(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('sets state with initialState prop values', function(done) {
    var otherState = {
      symbolType: 'square',
      symbolSize: '6',
      rotation: '.7',
      externalGraphic: 'foo',
      opacity: 1
    }
    var container = document.createElement('div');
    var component = ReactDOM.render((
      <PointSymbolizerEditor intl={intl} onChange={onChange} initialState={otherState}/>
    ), container);
    const actual = component.state;
    const expected = otherState;
    assert.deepEqual(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('changes opacity', function(done) {
    var container = document.createElement('div');
    var component = ReactDOM.render((
      <PointSymbolizerEditor intl={intl} onChange={onChange} initialState={initialState}/>
    ), container);
    var actual = component.state.opacity;
    var expected = undefined;
    assert.equal(actual, expected);
    component._onOpacityChange(null, .02);
    actual = component.state.opacity;
    expected = .02;
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('changes symbol type', function(done) {
    var container = document.createElement('div');
    var component = ReactDOM.render((
      <PointSymbolizerEditor intl={intl} onChange={onChange} initialState={initialState}/>
    ), container);
    var actual = component.state.symbolType;
    var expected = 'circle';
    assert.equal(actual, expected);
    component._onChangeSymbol(null, null, 'foo');
    actual = component.state.symbolType;
    expected = 'foo';
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
