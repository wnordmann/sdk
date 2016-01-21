/* eslint react/prop-types: 0 */
import React from 'react';
import ol from 'openlayers';
import './Measure.css';
import MapTool from './MapTool.js';
import UI from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  dropdowntext: {
    id: 'measure.dropdowntext',
    description: 'Text to use on the Measure drop down',
    defaultMessage: 'Measure'
  },
  measuredistancetext: {
    id: 'measure.measuredistancetext',
    description: 'Text for the measure distance menu option',
    defaultMessage: 'Distance'
  },
  measureareatext: {
    id: 'measure.measureareatext',
    description: 'Text for the measure area menu option',
    defaultMessage: 'Area'
  },
  cleartext: {
    id: 'measure.cleartext',
    description: 'Text for the clear measurements menu option',
    defaultMessage: 'Remove measurements'
  }
});

const wgs84Sphere = new ol.Sphere(6378137);

/**
 * Adds area and length measure tools to the map.
 */
@pureRender
class Measure extends MapTool {
  constructor(props) {
    super(props);
    this._tooltips = [];
  }
  componentDidMount() {
    this._layer = new ol.layer.Vector({
      title: null,
      managed: false,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      }),
      source: new ol.source.Vector()
    });
    this.props.map.addLayer(this._layer);
    this._drawStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    });
    var source = this._layer.getSource();
    this._interactions = {
      'AREA': new ol.interaction.Draw({
        source: source,
        type: 'Polygon',
        style: this._drawStyle
      }),
      'LENGTH': new ol.interaction.Draw({
        source: source,
        type: 'LineString',
        style: this._drawStyle
      })
    };
    for (var key in this._interactions) {
      this._interactions[key].on('drawstart', this._onDrawStart, this);
      this._interactions[key].on('drawend', this._onDrawEnd, this);
    }
  }
  _onDrawStart(evt) {
    this._sketch = evt.feature;
  }
  _onDrawEnd() {
    this._tooltipElement.className = 'tooltip tooltip-static';
    this._tooltip.setOffset([0, -7]);
    this._sketch = null;
    this._tooltipElement = null;
    this._createTooltip();
  }
  _formatArea(polygon) {
    var area;
    if (this.props.geodesic) {
      var sourceProj = this.props.map.getView().getProjection();
      var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
      var coordinates = geom.getLinearRing(0).getCoordinates();
      area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    } else {
      area = polygon.getArea();
    }
    if (area > 10000) {
      return (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
      return (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
  }
  _formatLength(line) {
    var length;
    if (this.props.geodesic) {
      var coordinates = line.getCoordinates();
      length = 0;
      var sourceProj = this.props.map.getView().getProjection();
      for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        length += wgs84Sphere.haversineDistance(c1, c2);
      }
    } else {
      length = Math.round(line.getLength() * 100) / 100;
    }
    if (length > 100) {
      return (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
      return (Math.round(length * 100) / 100) + ' ' + 'm';
    }
  }
  _pointerMoveHandler(evt) {
    if (!evt.dragging) {
      if (this._sketch) {
        var output, tooltipCoord;
        var geom = this._sketch.getGeometry();
        if (geom instanceof ol.geom.Polygon) {
          output = this._formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = this._formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        this._tooltipElement.innerHTML = output;
        this._tooltip.setPosition(tooltipCoord);
      }
    }
  }
  _createTooltip() {
    if (this._tooltipElement) {
      this._tooltipElement.parentNode.removeChild(this._tooltipElement);
    }
    this._tooltipElement = document.createElement('div');
    this._tooltipElement.className = 'tooltip tooltip-measure';
    this._tooltip = new ol.Overlay({
      element: this._tooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    this._tooltips.push(this._tooltip);
    this.props.map.addOverlay(this._tooltip);
  }
  _measureDistance() {
    var map = this.props.map;
    this.deactivate();
    map.on('pointermove', this._pointerMoveHandler, this);
    this.activate(this._interactions.LENGTH);
    this._createTooltip();
  }
  _measureArea() {
    var map = this.props.map;
    this.deactivate();
    map.on('pointermove', this._pointerMoveHandler, this);
    this.activate(this._interactions.AREA);
    this._createTooltip();
  }
  _clear() {
    var map = this.props.map;
    this.deactivate();
    for (var i = 0, ii = this._tooltips.length; i < ii; i++){
      map.removeOverlay(this._tooltips[i]);
    }
    this._layer.getSource().clear();
    map.un('pointermove', this._pointerMoveHandler, this);
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.Dropdown {...this.props} title={formatMessage(messages.dropdowntext)}>
        <UI.DropdownItem onSelect={this._measureDistance.bind(this)}>{formatMessage(messages.measuredistancetext)}</UI.DropdownItem>
        <UI.DropdownItem onSelect={this._measureArea.bind(this)}>{formatMessage(messages.measureareatext)}</UI.DropdownItem>
        <UI.DropdownItem onSelect={this._clear.bind(this)}>{formatMessage(messages.cleartext)}</UI.DropdownItem>
      </UI.Dropdown>
    );
  }
}

Measure.propTypes = {
  /**
   * Should measurements be geodesic?
   */
  geodesic: React.PropTypes.bool,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Measure.defaultProps = {
  geodesic: true
};

export default injectIntl(Measure);
