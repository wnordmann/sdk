/* global it, describe, expect */

import deepFreeze from 'deep-freeze';

import reducer from '../../src/reducers/mapControl';
import { CONTROL } from '../../src/action-types';

describe('mapControl reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('should add a control', () => {
		const control = {
      name:'test',
      innerHtmlElement: 'div',
      innerElementClass: 'test',
      outerHtmlElement: 'div',
      outerElementClass: 'test',
      text: 'test'
    }

    const test_action = {
      type: CONTROL.ADD,
      control
    };
    deepFreeze(test_action);

    const expected_state = {
      test: {
	      name:'test',
	      innerHtmlElement: 'div',
	      innerElementClass: 'test',
	      outerHtmlElement: 'div',
	      outerElementClass: 'test',
	      text: 'test'
	    }
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
  });

});
