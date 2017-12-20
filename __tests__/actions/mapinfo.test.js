/* global describe, it, expect */

import * as actions from '../../src/actions/mapinfo';
import {MAPINFO} from '../../src/action-types';

describe('test that mapinfo actions are properly created', () => {

  it('should issue an action to set the map size', () => {
    const size = [1000, 500];
    expect(actions.setMapSize(size)).toEqual({
      type: MAPINFO.SET_SIZE,
      size,
    });
  });

});

