import fetch from 'isomorphic-fetch'

/** Action Defintions for the map.
 */

import { MAP } from '../action-types';

export function setView(center, zoom) {
  return {
    type: MAP.SET_VIEW,
    view: { center, zoom }
  }
}

export function addLayer(layerDef) {
  return {
    type: MAP.ADD_LAYER,
    layerDef
  }
}

export function addSource(sourceName, sourceDef) {
  return {
    type: MAP.ADD_SOURCE,
    sourceName,
    sourceDef
  }
}

export function removeLayer(layerId) {
  return {
    type: MAP.REMOVE_LAYER,
    layerId
  }
}

export function removeSource(sourceName) {
  return {
    type: MAP.REMOVE_SOURCE,
    sourceName
  }
}

export function updateLayer(layerId, layerDef) {
  return {
    type: MAP.UPDATE_LAYER,
    layerId, layerDef
  }
}


export function addFeatures(sourceName, features) {
  return {
    type: MAP.ADD_FEATURES,
    sourceName, features
  }
}

export function removeFeatures(sourceName, filter) {
  return {
    type: MAP.REMOVE_FEATURES,
    sourceName, filter
  }
}

export function setLayerVisibility(layerId, visibility) {
  return {
    type: MAP.SET_LAYER_VISIBILITY,
    layerId,
    visibility
  }
}

export function requestContext() {
  return {
    type: MAP.REQUEST_CONTEXT
  }
}

export function receiveContext(context) {
  return {
    type: MAP.RECEIVE_CONTEXT,
    context
  }
}

// thunk action creator
export function fetchContext(url) {
  return function (dispatch) {
    dispatch(requestContext());
    return fetch(url)
      .then(
        response => response.json(),
        error => console.log('An error occured.', error)
      )
      .then(json =>
        dispatch(receiveContext(json))
      )
  }
}
