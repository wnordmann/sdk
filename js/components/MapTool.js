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

import React from 'react';
import ol from 'openlayers';
import ToolConstants from '../constants/ToolConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import ToolActions from '../actions/ToolActions.js';

/**
 * A tool that manages interactions on the map. The interactions will be
 * activated and deactivated depending on toggleGroup.
 */
export default class MapTool extends React.Component {
  constructor(props) {
    super(props);
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case ToolConstants.DISABLE_ALL_TOOLS:
          me.disable();
          break;
        case ToolConstants.ENABLE_ALL_TOOLS:
          me.enable();
          break;
        case ToolConstants.ACTIVATE_TOOL:
          if (me.props.toggleGroup && me.props.toggleGroup === action.toggleGroup) {
            if (me !== action.tool) {
              if (me.props.toolId) {
                if (me.props.toolId !== action.toolId) {
                  me.deactivate();
                } else {
                  me._active !== true && me.activate();
                }
              } else {
                me.deactivate();
              }
            }
          }
          break;
        default:
          break;
      }
    });
  }
  disable() {
    // subclasses need to implement this
  }
  enable() {
    // subclasses need to implement this
  }
  deactivate() {
    if (this._currentInteractions) {
      var map = this.props.map;
      for (var i = 0, ii = this._currentInteractions.length; i < ii; ++i) {
        map.removeInteraction(this._currentInteractions[i]);
      }
    }
    delete this._currentInteractions;
    this._active = false;
  }
  activate(interactions) {
    if (interactions instanceof ol.interaction.Interaction) {
      this._currentInteractions = [interactions];
    } else if (Array.isArray(interactions)) {
      this._currentInteractions = interactions;
    } else {
      this._currentInteractions = [];
    }
    var map = this.props.map;
    for (var i = 0, ii = this._currentInteractions.length; i < ii; ++i) {
      map.addInteraction(this._currentInteractions[i]);
    }
    ToolActions.activateTool(this, this.props.toggleGroup, this.props.toolId);
    this._active = true;
  }
}

MapTool.propTypes = {
  /**
   * The map onto which to activate and deactivate the interactions.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.
   */
  toggleGroup: React.PropTypes.string,
  /**
   * Identifier to use for this tool. Can be used to group tools together.
   */
  toolId: React.PropTypes.string
};
