/* global it, beforeEach, describe, expect */

import deepFreeze from 'deep-freeze';

import {MAPINFO} from '../../src/action-types';
import reducer from '../../src/reducers/mapinfo';

describe('mapinfo reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      size: null,
    });
  });

  it('should set the map size', () => {
    let state = {};
    deepFreeze(state);
    const size = [1000, 500];
    const action = {
      type: MAPINFO.SET_SIZE,
      size,
    };
    deepFreeze(action);
    expect(reducer(state, action)).toEqual({
      size: [1000, 500],
    });
  });
});
