import React from 'react';
import SelectActions from '../actions/SelectActions.js';

export default class Select extends React.Component {
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
          SelectActions.selectFeatures(lyr, selected);
        }
      });
    }, this);
  }
  _selectByRectangle() {
    var map = this.props.map;
    if (this._currentInteraction) {
      map.removeInteraction(this._currentInteraction);
    }
    this._currentInteraction = this._interactions.RECTANGLE;
    map.addInteraction(this._currentInteraction);
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

Select.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};
