/* global ol */
import React from 'react';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerActions from '../actions/LayerActions.js';

/**
 * A tool that manages interactions on the map. The interactions will be
 * activated and deactivated depending on toggleGroup.
 */
export default class MapTool extends React.Component {
  constructor(props) {
    super(props);
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.ACTIVATE_TOOL:
          if (this.props.toggleGroup && this.props.toggleGroup === action.toggleGroup) {
            if (this !== action.tool) {
              this.deactivate();
            }
          }
          break;
        default:
          break;
      }
    });
  }
  deactivate() {
    if (this._currentInteractions) {
      var map = this.props.map;
      for (var i = 0, ii = this._currentInteractions.length; i < ii; ++i) {
        map.removeInteraction(this._currentInteractions[i]);
      }
    }
  }
  activate(interactions) {
    if (interactions instanceof ol.interaction.Interaction) {
      this._currentInteractions = [interactions];
    } else {
      this._currentInteractions = interactions;
    }
    var map = this.props.map;
    for (var i = 0, ii = this._currentInteractions.length; i < ii; ++i) {
      map.addInteraction(this._currentInteractions[i]);
    }
    LayerActions.activateTool(this, this.props.toggleGroup);
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
  toggleGroup: React.PropTypes.string
};
