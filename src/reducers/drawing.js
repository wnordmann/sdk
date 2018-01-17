/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 */

/** @module reducers/drawing
 * @desc Drawing Reducer
 *
 *  This initiates drawing on the map and can track
 *  changes as they are made.
 *
 */

import {DRAWING} from '../action-types';

const defaultState = {
  interaction: null,
  sourceName: null,
  measureFeature: null,
  measureSegments: null,
  measureDone: false,
  editStyle: null,
  modifyStyle: null,
  selectStyle: null
};

/** Drawing reducer.
 *  @param {Object} state The redux state.
 *  @param {Object} action The selected action object.
 *
 *  @returns {Object} The new state object.
 */
export default function drawingReducer(state = defaultState, action) {
  switch (action.type) {
    case DRAWING.END:
      // when interaction is null, drawing should cease.
      return Object.assign({}, state, {
        interaction: null,
        sourceName: null,
        measureFeature: null,
        measureSegments: null
      });
    case DRAWING.START:
      return Object.assign({}, state, {
        interaction: action.interaction,
        sourceName: action.sourceName,
        measureDone: false,
        measureFeature: null,
        measureSegments: null,
      });
    case DRAWING.SET_EDIT_STYLE:
      return Object.assign({}, state, {
        editStyle: action.editStyle
      });
    case DRAWING.SET_SELECT_STYLE:
      return Object.assign({}, state, {
        selectStyle: action.selectStyle
      });
    case DRAWING.SET_MODIFY_STYLE:
      return Object.assign({}, state, {
        modifyStyle: action.modifyStyle
      });
    case DRAWING.SET_MEASURE_FEATURE:
      return Object.assign({}, state, {
        measureDone: false,
        measureFeature: action.feature,
        measureSegments: action.segments,
      });
    case DRAWING.FINALIZE_MEASURE_FEATURE:
      return Object.assign({}, state, {
        measureDone: true,
      });
    case DRAWING.CLEAR_MEASURE_FEATURE:
      return Object.assign({}, state, {
        measureFeature: null,
        measureSegments: null,
        measureDone: false,
      });
    default:
      return state;
  }
}
