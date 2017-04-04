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

import ToolConstants from '../constants/ToolConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
  showPopup: (feature, layer) => {
    AppDispatcher.handleAction({
      type: ToolConstants.SHOW_POPUP,
      feature: feature,
      layer: layer
    });
  },
  showEditPopup: (feature) => {
    AppDispatcher.handleAction({
      type: ToolConstants.SHOW_EDIT_POPUP,
      feature: feature
    });
  },
  startPlayback: () => {
    AppDispatcher.handleAction({
      type: ToolConstants.START_PLAYBACK
    });
  },
  stopPlayback: () => {
    AppDispatcher.handleAction({
      type: ToolConstants.STOP_PLAYBACK
    });
  },
  disableAllTools: () => {
    AppDispatcher.handleAction({
      type: ToolConstants.DISABLE_ALL_TOOLS
    });
  },
  enableAllTools: () => {
    AppDispatcher.handleAction({
      type: ToolConstants.ENABLE_ALL_TOOLS
    });
  },
  activateTool: (tool, toggleGroup, toolId) => {
    AppDispatcher.handleAction({
      type: ToolConstants.ACTIVATE_TOOL,
      tool: tool,
      toggleGroup: toggleGroup,
      toolId: toolId
    });
  }
};
