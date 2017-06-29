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

export function setLayerVisibility(layerId, vis) {
  return {
    type: MAP.SET_LAYER_VISIBILITY,
    id: layerId,
    visibility: vis
  }
}
