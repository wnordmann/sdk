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

import ol from 'openlayers';
import ToolConstants from './constants/ToolConstants';
import AppDispatcher from './dispatchers/AppDispatcher';
import ToolActions from './actions/ToolActions';

export default {
  activate(tool, interactions) {
    if (interactions instanceof ol.interaction.Interaction) {
      tool.currentInteractions = [interactions];
    } else if (Array.isArray(interactions)) {
      tool.currentInteractions = interactions;
    } else {
      tool.currentInteractions = [];
    }
    var map = tool.props.map;
    for (var i = 0, ii = tool.currentInteractions.length; i < ii; ++i) {
      map.addInteraction(tool.currentInteractions[i]);
    }
    ToolActions.activateTool(tool, tool.props.toggleGroup, tool.props.toolId);
    tool.active = true;
  },
  deactivate(tool) {
    if (tool.currentInteractions) {
      var map = tool.props.map;
      for (var i = 0, ii = tool.currentInteractions.length; i < ii; ++i) {
        map.removeInteraction(tool.currentInteractions[i]);
      }
    }
    delete tool.currentInteractions;
    tool.active = false;
  },
  register(tool) {
    return AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case ToolConstants.DISABLE_ALL_TOOLS:
          if (tool.disable) {
            tool.disable();
          }
          break;
        case ToolConstants.ENABLE_ALL_TOOLS:
          if (tool.enable) {
            tool.enable();
          }
          break;
        case ToolConstants.ACTIVATE_TOOL:
          if (tool.props.toggleGroup && tool.props.toggleGroup === action.toggleGroup) {
            if (tool !== action.tool) {
              if (tool.props.toolId) {
                if (tool.props.toolId !== action.toolId) {
                  tool.deactivate();
                } else {
                  if (tool.active !== true) {
                    tool.activate();
                  }
                }
              } else {
                tool.deactivate();
              }
            }
          }
          break;
        default:
          break;
      }
    });
  }
};
