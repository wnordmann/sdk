/* global it, describe, expect */

import deepFreeze from 'deep-freeze';

import * as actions from '../../src/actions/drawing';
import reducer from '../../src/reducers/drawing';
import {DRAWING} from '../../src/action-types';

describe('drawing reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      interaction: null,
      sourceName: null,
      measureFeature: null,
      measureSegments: null,
      currentMode: null,
      afterMode: null,
      measureDone: false,
      editStyle: null,
      modifyStyle: null,
      selectStyle: null
    });
  });

  it('should set the interaction and sourceName', () => {
    const source_name = 'points-test';
    const geo_type = 'Point';

    const test_action = {
      type: DRAWING.START,
      interaction: geo_type,
      sourceName: source_name,
    };
    deepFreeze(test_action);

    const expected_state = {
      interaction: geo_type,
      sourceName: source_name,
      measureFeature: null,
      measureSegments: null,
      currentMode: undefined,
      afterMode: undefined,
      measureDone: false,
      editStyle: null,
      modifyStyle: null,
      selectStyle: null
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
  });

  it('should null out all the things', () => {
    const initial_state = {
      interaction: 'Point',
      sourceName: 'test-points',
    };
    deepFreeze(initial_state);

    const expected_state = {
      interaction: null,
      sourceName: null,
      currentMode: undefined,
      afterMode: undefined,
      measureDone: false,
      measureFeature: null,
      measureSegments: null,
    };

    expect(reducer(initial_state, {type: DRAWING.END})).toEqual(expected_state);
  });

  it('should set and clear the measure feature and segments', () => {
    const line = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Line',
        coordinates: [
          [0, 0], [1, 1], [2, 2],
        ],
      },
    };
    const segs = [1, 1];

    deepFreeze(line);
    deepFreeze(segs);

    const state = reducer(undefined, actions.setMeasureFeature(line, segs));
    deepFreeze(state);

    expect(state).toEqual({
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: line,
      measureSegments: segs,
      measureDone: false,
      editStyle: null,
      modifyStyle: null,
      selectStyle: null
    });

    const cleared_state = reducer(state, actions.clearMeasureFeature(line, segs));
    expect(cleared_state).toEqual({
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: null,
      modifyStyle: null,
      selectStyle: null
    });
  });

  it('should finalize the measure feature', () => {
    const line = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Line',
        coordinates: [
          [0, 0], [1, 1], [2, 2],
        ],
      },
    };
    const segs = [1, 1];

    deepFreeze(line);
    deepFreeze(segs);

    let state = reducer(undefined, actions.setMeasureFeature(line, segs));
    state = reducer(state, actions.finalizeMeasureFeature());
    deepFreeze(state);

    expect(state).toEqual({
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: line,
      measureSegments: segs,
      measureDone: true,
      editStyle: null,
      modifyStyle: null,
      selectStyle: null
    });
  });

  it('should change the select style', () => {
    const selectStyle = 'Point';

    const test_action = {
      type: DRAWING.SET_SELECT_STYLE,
      selectStyle: selectStyle
    };
    deepFreeze(test_action);

    const expected_state = {
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: null,
      modifyStyle: null,
      selectStyle: selectStyle
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
  });
  it('should change the modify style', () => {
    const modifyStyle = 'Point';

    const test_action = {
      type: DRAWING.SET_MODIFY_STYLE,
      modifyStyle: modifyStyle
    };
    deepFreeze(test_action);

    const expected_state = {
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: null,
      modifyStyle: modifyStyle,
      selectStyle: null
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
  });
  it('should change the edit style', () => {
    const editStyle = 'Point';

    const test_action = {
      type: DRAWING.SET_EDIT_STYLE,
      editStyle: editStyle
    };
    deepFreeze(test_action);

    const expected_state = {
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: editStyle,
      modifyStyle: null,
      selectStyle: null
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
  });
  it('should keep the style even if drawing end', () => {
    const editStyle = 'Point';

    const test_action = {
      type: DRAWING.SET_EDIT_STYLE,
      editStyle: editStyle
    };
    deepFreeze(test_action);

    const expected_state = {
      interaction: null,
      sourceName: null,
      currentMode: null,
      afterMode: null,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: editStyle,
      modifyStyle: null,
      selectStyle: null
    };

    expect(reducer(undefined, test_action)).toEqual(expected_state);
    const source_name = 'points-test';
    const geo_type = 'Point';

    const test_action_start = {
      type: DRAWING.START,
      interaction: geo_type,
      sourceName: source_name,
    };
    const expected_state_in_between = {
      interaction: geo_type,
      sourceName: source_name,
      currentMode: undefined,
      afterMode: undefined,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: editStyle,
      modifyStyle: null,
      selectStyle: null
    };

    const expected_end_state = {
      interaction: null,
      sourceName: null,
      currentMode: undefined,
      afterMode: undefined,
      measureFeature: null,
      measureSegments: null,
      measureDone: false,
      editStyle: editStyle,
      modifyStyle: null,
      selectStyle: null
    };

    deepFreeze(test_action_start);
    expect(reducer(expected_state, test_action_start)).toEqual(expected_state_in_between);
    expect(reducer(expected_state_in_between, {type: DRAWING.END})).toEqual(expected_end_state);
  });
});
