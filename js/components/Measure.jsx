import React from 'react';
import './Measure.css';
import MapTool from './MapTool.js';

export default class Measure extends MapTool {
  constructor(props) {
    super(props);
    this._tooltips = [];
  }
  componentDidMount() {
    this._layer = new ol.layer.Vector({
      hideFromLayerList: true,
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
  _onDrawEnd(evt) {
    this._tooltipElement.className = 'tooltip tooltip-static';
    this._tooltip.setOffset([0, -7]);
    this._sketch = null;
    this._tooltipElement = null;
    this._createTooltip();
  }
  _formatArea(polygon) {
    var area = polygon.getArea();
    if (area > 10000) {
      return (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
      return (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
  }
  _formatLength(line) {
    var length = Math.round(line.getLength() * 100) / 100;
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
    return (
      <li className='dropdown'>
        <a href='#' className='dropdown-toggle' data-toggle='dropdown'> Measure <span className='caret'></span> </a>
        <ul className='dropdown-menu'>
          <li><a onClick={this._measureDistance.bind(this)} href='#'>Distance</a></li>
          <li><a onClick={this._measureArea.bind(this)} href='#'>Area</a></li>
          <li><a onClick={this._clear.bind(this)} href='#'>Remove measurements</a></li>
        </ul>
      </li>
    );
  }
}
