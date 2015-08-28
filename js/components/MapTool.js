/* global ol */
import React from 'react';
import MapConstants from '../constants/MapConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LayerActions from '../actions/LayerActions.js';

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
    if (this._currentInteraction) {
      this.props.map.removeInteraction(this._currentInteraction);
    }
  }
  activate(interaction) {
    this._currentInteraction = interaction;
    this.props.map.addInteraction(this._currentInteraction);
    LayerActions.activateTool(this, this.props.toggleGroup);
  }
}

MapTool.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  toggleGroup: React.PropTypes.string
};
