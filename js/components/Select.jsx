import React from 'react';
import SelectActions from '../actions/SelectActions.js';
import SelectConstants from '../constants/SelectConstants.js';
import MapTool from './MapTool.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default class Select extends MapTool {
  constructor(props) {
    super(props);
    this._select = new ol.interaction.Select();
    this.props.map.addInteraction(this._select);
    this._interactions = {
      'RECTANGLE': new ol.interaction.DragBox({
        condition: ol.events.condition.noModifierKeys,
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [0, 0, 255, 1]
          })
        })
      })
    };
    this._interactions.RECTANGLE.on('boxend', function(evt) {
      var box = evt.target.getGeometry().getExtent();
      var selectedFeatures = this._select.getFeatures();
      selectedFeatures.clear();
      this.props.map.getLayers().forEach(function(lyr) {
        if (lyr.get('isSelectable') === true) {
          var selected = [];
          lyr.getSource().forEachFeatureIntersectingExtent(box, function(feature) {
            selected.push(feature);
            selectedFeatures.push(feature);
          });
          SelectActions.selectFeatures(lyr, selected, this);
        }
      });
    }, this);
    AppDispatcher.register((payload) => {
      let action = payload.action;
      var feature = action.feature;
      var selectedFeatures = this._select.getFeatures();
      switch(action.type) {
        case SelectConstants.SELECT_FEATURES:
          if (action.cmp !== this) {
            selectedFeatures.extend(action.features);
          }
          break;
        case SelectConstants.SELECT_FEATURE:
          selectedFeatures.push(feature);
          break;
        case SelectConstants.UNSELECT_FEATURE:
          selectedFeatures.remove(feature);
          break;
        default:
          break;
      }
    });
  }
  _selectByRectangle() {
    var map = this.props.map;
    this.deactivate();
    this.activate(this._interactions.RECTANGLE);
  }
  render() {
    return (
      <li className='dropdown'>
        <a href='#' className='dropdown-toggle' data-toggle='dropdown'> Select <span className='caret'></span> </a>
        <ul className='dropdown-menu'>
          <li><a onClick={this._selectByRectangle.bind(this)} href='#'>Select by rectangle</a></li>
        </ul>
      </li>
    );
  }
}
