import React from 'react';
import ol from 'openlayers';
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
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        case MapConstants.ACTIVATE_TOOL:
          if (me.props.toggleGroup && me.props.toggleGroup === action.toggleGroup) {
            if (me !== action.tool) {
              me.deactivate();
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
    delete this._currentInteractions;
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
