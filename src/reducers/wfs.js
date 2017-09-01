
import uuid from 'uuid';

import { WFS } from '../action-types';

const defaultState = {
  sources: {},
  actions: {},
};

function addSource(state, action) {
  const new_source = {};
  new_source[action.sourceName] = action.sourceDef;

  const new_sources = Object.assign({}, state.sources, new_source);
  return Object.assign({}, state, {
    sources: new_sources
  });
}

function removeSource(state, action) {
  const new_sources = Object.assign({}, state.sources);
  delete new_sources[action.sourceName];
  return Object.assign({}, state, { sources: new_sources });
}

function addAction(state, action) {
    const action_id = uuid.v4();

    const new_action = {};
    new_action[action_id] = action;

    const new_actions = Object.assign({}, state.actions, new_action);
    return Object.assign({}, state, {actions: new_actions});
}

function finishedAction(state, action) {
  const new_actions = Object.assign({}, state.actions);
  delete new_actions[action.id];
  return Object.assign({}, state, { actions: new_actions });
}

export default function WfsReducer(state = defaultState, action) {
  switch(action.type) {
    // add a source to the WFS configuration
    case WFS.ADD_SOURCE:
      return addSource(state, action);
    // remove a source from the WFS configuration
    case WFS.REMOVE_SOURCE:
      return removeSource(state, action);
    case WFS.INSERT:
    case WFS.UPDATE:
    case WFS.DELETE:
      return addAction(state, action);
    case WFS.FINISHED:
      return finishedAction(state, action);
    default:
      return state;
  }
};
