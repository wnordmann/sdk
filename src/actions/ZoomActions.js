/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {MAP} from './ActionTypes'
export const getDelta = (delta) => {
  return {
    // Unique identifier
    type: 'GET_DELTA',
    // Payload
    delta
  }
};
export const zoomIn = (delta) => {
  return {
    type: MAP.ZOOM_IN,
    zoomDelta: delta
  }
};
export const zoomOut = (delta) => {
  return {
    type: MAP.ZOOM_OUT,
    zoomDelta: delta
  }
};
