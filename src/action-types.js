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

export const MAP = {
  SET_VIEW: 'MAP_SET_VIEW',
  SET_ZOOM: 'MAP_SET_ZOOM',
  ZOOM_IN: 'MAP_ZOOM_IN',
  ZOOM_OUT: 'MAP_ZOOM_OUT',
  ADD_LAYER: 'MAP_ADD_LAYER',
  SET_NAME: 'MAP_SET_NAME',
  SET_ROTATION: 'MAP_SET_ROTATION',
  ADD_SOURCE: 'MAP_ADD_SOURCE',
  REMOVE_LAYER: 'MAP_REMOVE_LAYER',
  REMOVE_SOURCE: 'MAP_REMOVE_SOURCE',
  UPDATE_LAYER: 'MAP_UPDATE_LAYER',
  ADD_FEATURES: 'MAP_ADD_FEATURES',
  REMOVE_FEATURES: 'MAP_REMOVE_FEATURES',
  SET_LAYER_METADATA: 'MAP_SET_LAYER_METADATA',
  SET_LAYER_VISIBILITY: 'MAP_SET_LAYER_VISIBILITY',
  SET_LAYER_IN_GROUP_VISIBLE: 'MAP_SET_LAYER_IN_GROUP_VISIBLE',
  RECEIVE_CONTEXT: 'MAP_RECEIVE_CONTEXT',
  ORDER_LAYER: 'MAP_ORDER_LAYER',
  CLUSTER_POINTS: 'MAP_CLUSTER_POINTS',
  SET_CLUSTER_RADIUS: 'MAP_SET_CLUSTER_RADIUS',
  SET_SPRITE: 'MAP_SET_SPRITE',
  UPDATE_SOURCE: 'MAP_UPDATE_SOURCE',
  UPDATE_METADATA: 'MAP_UPDATE_METADATA',
  MOVE_GROUP: 'MAP_MOVE_GROUP',
};

export const DRAWING = {
  START: 'DRAWING_START',
  END: 'DRAWING_END',
  SET_MEASURE_FEATURE: 'DRAWING_SET_MEASURE_FEATURE',
  CLEAR_MEASURE_FEATURE: 'DRAWING_CLEAR_MEASURE_FEATURE',
};

export const PRINT = {
  EXPORT_IMAGE: 'PRINT_EXPORT_IMAGE',
  RECEIVE_IMAGE: 'PRINT_RECEIVE_IMAGE',
};

export const WFS = {
  INSERT: 'WFS_INSERT',
  UPDATE: 'WFS_UPDATE',
  DELETE: 'WFS_DELETE',
  ADD_SOURCE: 'WFS_ADD_SOURCE',
  REMOVE_SOURCE: ' WFS_REMOVE_SOURCE',
  FINISHED: 'WFS_FINISHED',
};

export const MAPBOX = {
  CONFIGURE: 'MAPBOX_CONFIGURE',
};

export default {
  MAP,
  DRAWING,
  PRINT,
  WFS,
  MAPBOX,
};
