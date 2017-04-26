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

/* eslint react/prop-types: 0 */
import React from 'react';
import ol from 'openlayers';
import './Measure.css';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ToolUtil from '../toolutil';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Button from './Button';
import Divider from 'material-ui/Divider';
import Delete from 'material-ui/svg-icons/action/delete';

const messages = defineMessages({
  dropdowntext: {
    id: 'measure.dropdowntext',
    description: 'Text to use on the Measure drop down',
    defaultMessage: 'Measure'
  },
  dropdowntitle: {
    id: 'measure.dropdowntitle',
    description: 'Title to use on the Measure drop down',
    defaultMessage: 'Measure distance and area on the map'
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
    defaultMessage: 'Remove'
  }
});

const wgs84Sphere = new ol.Sphere(6378137);

/**
 * Adds area and length measure tools as a menu button.
 *
 * ```xml
 * <Measure toggleGroup='navigation' map={map}/>
 * ```
 *
 * ![Measure](../Measure.png)
 * ![MeasureOpen](../MeasureOpen.png)
 */
class Measure extends React.PureComponent {
  static propTypes = {
    /**
     * The map onto which to activate and deactivate the interactions.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
     * The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.
     */
    toggleGroup: React.PropTypes.string,
    /**
     * Identifier to use for this tool. Can be used to group tools together.
     */
    toolId: React.PropTypes.string,
    /**
     * Should measurements be geodesic?
     */
    geodesic: React.PropTypes.bool,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    geodesic: true
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this._dispatchToken = ToolUtil.register(this);
    this._tooltips = [];
    this.state = {
      secondary: false,
      value: null,
      disabled: false
    };
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  componentDidMount() {
    var areaStyle = Measure.areaStyle;
    var lengthStyle = Measure.lengthStyle;
    this._layer = new ol.layer.Vector({
      title: null,
      zIndex: 1000,
      managed: false,
      style: function(feature) {
        if (feature.getGeometry() instanceof ol.geom.Polygon) {
          return areaStyle;
        } else {
          return lengthStyle;
        }
      },
      source: new ol.source.Vector({wrapX: false})
    });
    this.props.map.addLayer(this._layer);
    var source = this._layer.getSource();
    this._interactions = {
      'AREA': new ol.interaction.Draw({
        source: source,
        type: 'Polygon',
        style: Measure.drawStyle
      }),
      'LENGTH': new ol.interaction.Draw({
        source: source,
        type: 'LineString',
        style: Measure.drawStyle
      })
    };
    for (var key in this._interactions) {
      this._interactions[key].on('drawstart', this._onDrawStart, this);
      this._interactions[key].on('drawend', this._onDrawEnd, this);
    }
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  static lengthStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#FFC107',
      width: 2
    })
  });
  static areaStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255,213,79, 0.5)'
    }),
    stroke: new ol.style.Stroke({
      color: '#FFA000'
    })
  });
  static drawStyle = new ol.style.Style({
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
  _onDrawStart(evt) {
    this._sketch = evt.feature;
    this._createTooltip();
  }
  _onDrawEnd() {
    this._tooltipElement.className = 'sdk-tooltip sdk-tooltip-static';
    this._tooltip.setOffset([0, -7]);
    this._sketch = null;
    this._tooltipElement = null;
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
    this._tooltipElement.className = 'sdk-tooltip sdk-tooltip-measure';
    this._tooltip = new ol.Overlay({
      element: this._tooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    this._tooltips.push(this._tooltip);
    this.props.map.addOverlay(this._tooltip);
  }
  activate(interactions) {
    ToolUtil.activate(this, interactions);
    this.setState({secondary: true});
  }
  deactivate() {
    ToolUtil.deactivate(this);
    this.setState({value: null, secondary: false});
  }
  _measureDistance() {
    var map = this.props.map;
    this.deactivate();
    map.on('pointermove', this._pointerMoveHandler, this);
    this.activate(this._interactions.LENGTH);
  }
  _measureArea() {
    var map = this.props.map;
    this.deactivate();
    map.on('pointermove', this._pointerMoveHandler, this);
    this.activate(this._interactions.AREA);
  }
  _clear() {
    var map = this.props.map;
    this.deactivate();
    for (var i = 0, ii = this._tooltips.length; i < ii; i++) {
      map.removeOverlay(this._tooltips[i]);
    }
    this._tooltips = [];
    this._layer.getSource().clear();
    map.un('pointermove', this._pointerMoveHandler, this);
  }
  _handleChange(event, value) {
    if (value === 1) {
      this._measureDistance();
    } else if (value === 2) {
      this._measureArea();
    } else {
      this._clear();
    }
    this.setState({value: value});
  }
  disable() {
    this._clear();
    this.setState({disabled: true});
  }
  enable() {
    this.setState({disabled: false});
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <IconMenu
        style={this.props.style}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}} targetOrigin={{horizontal: 'right', vertical: 'top'}}
        className={classNames('sdk-component measure', this.props.className)}
        iconButtonElement={<Button secondary={this.state.secondary} buttonType='Icon' tooltip={formatMessage(messages.dropdowntitle)} disabled={this.state.disabled} iconClassName="headerIcons ms ms-measure-distance" />}
        value={this.state.value}
        onChange={this._handleChange.bind(this)}>
        <MenuItem disabled={this.state.disabled} value={1} primaryText={formatMessage(messages.measuredistancetext)} leftIcon={<i className="ms ms-measure-distance"></i>} />
        <MenuItem disabled={this.state.disabled} value={2} primaryText={formatMessage(messages.measureareatext)} leftIcon={<i className="ms ms-measure-area"></i>} />
        <Divider />
        <MenuItem disabled={this.state.disabled} primaryText={formatMessage(messages.cleartext)} leftIcon={<Delete />} />
      </IconMenu>
    );
  }
}

export default injectIntl(Measure);
