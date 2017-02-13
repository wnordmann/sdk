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

import * as types from '../actiontypes';
import ol from 'openlayers';
import LayerIdService from '../../services/LayerIdService';

const layerCache = {};

const setId = function(lyr) {
  var id = lyr.get('id');
  if (id === undefined) {
    id = LayerIdService.generateId();
    lyr.set('id', id);
  }
  layerCache[id] = lyr;
  return id;
}

export const findLayerById = function(id) {
  return layerCache[id];
}

const getChildren = function(lyr, layer, flatCopy) {
  if (layer instanceof ol.layer.Group) {
    lyr.children = [];
    layer.getLayers().forEach(function(child) {
      var childId = setId(child);
      var childObj = {id: childId};
      flatCopy.push({id: childId, parentId: lyr.id, title: child.get('title')});
      getChildren(childObj, child);
      lyr.children.push(childObj);
    });
  }
};

const layers = function(state = {layers: [], flatLayers: []}, action) {
  switch (action.type) {
    case types.ADD_LAYER:
      var copy = state.layers.slice(0);
      var flatCopy = state.flatLayers.slice(0);
      var id = setId(action.layer);
      var lyr = {
        id: id
      };
      if (action.layer instanceof ol.layer.Group) {
        getChildren(lyr, action.layer, flatCopy);
      }
      copy.unshift(lyr);
      flatCopy.unshift({id: id, title: action.layer.get('title')});
      return {layers: copy, flatLayers: flatCopy};
    case types.REMOVE_LAYER:
      if (action.group) {
        return state;
      } else {
        return {
          flatLayers: state.flatLayers.filter(function(item) {
             return (item.id !== action.layer.get('id')) && (item.parentId !== action.layer.get('id'));
          }),
          layers: state.layers.filter(function(item) {
            return item.id !== action.layer.get('id');
          })
        };
      }
      break;
    default:
      return state;
  }
}

export default layers;
