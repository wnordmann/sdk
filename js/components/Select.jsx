/* eslint react/prop-types: 0 */
import React from 'react';
import ol from 'openlayers';
import SelectActions from '../actions/SelectActions.js';
import MapTool from './MapTool.js';
import FeatureStore from '../stores/FeatureStore.js';
import UI from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  menubuttontext: {
    id: 'select.menubuttontext',
    description: 'Menu button text for select menu',
    defaultMessage: 'Selection'
  },
  rectangletext: {
    id: 'select.rectangletext',
    description: 'Text for select by rectangle menu option',
    defaultMessage: 'Select by rectangle'
  }
});

/**
 * The select tool allows users to select features in multiple layers at a time by drawing a rectangle.
 */
class Select extends MapTool {
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
            if (feature.get('features')) {
              selected = selected.concat(feature.get('features'));
            } else {
              selected.push(feature);
            }
          });
          SelectActions.selectFeatures(lyr, selected, true);
        }
      }, this);
    }, this);
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange.bind(this));
  }
  _onChange() {
    var state = FeatureStore.getState();
    var selectedFeatures = this._select.getFeatures();
    selectedFeatures.clear();
    for (var key in state) {
      for (var i = 0, ii = state[key].selected.length; i < ii; ++i) {
        selectedFeatures.push(state[key].selected[i]);
      }
    }
  }
  _selectByRectangle() {
    this.deactivate();
    this.activate(this._interactions.RECTANGLE);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.Dropdown title={formatMessage(messages.menubuttontext)}>
        <UI.DropdownItem onSelect={this._selectByRectangle.bind(this)}>{formatMessage(messages.rectangletext)}</UI.DropdownItem>
      </UI.Dropdown>
    );
  }
}

Select.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Select);
