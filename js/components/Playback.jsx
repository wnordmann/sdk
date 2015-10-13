import React from 'react';
import ol from 'openlayers';
import Button from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Grids from 'pui-react-grids';
import './Playback.css';

/**
 * Adds a slider to the map that can be used to select a given date, and modifies the visibility of layers and features depending on their timestamp and the current time.
 */
export default class Playback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      play: true
    };
    this._interval = (this.props.maxDate - this.props.minDate) / this.props.numIntervals;
  }
  componentDidMount() {
    this._setStyleFunctions();
    if (this.props.autoPlay === true) {
      this._playPause();
    }
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _play() {
    var newTime = React.findDOMNode(this.refs.dateInput).valueAsNumber + this._interval;
    if (newTime > this.props.maxDate) {
      newTime = this.props.minDate;
    }
    React.findDOMNode(this.refs.dateInput).valueAsNumber = newTime;
    React.findDOMNode(this.refs.rangeInput).valueAsNumber = newTime;
    this._refreshTimeLayers();
  }
  _playPause() {
    var play = !this.state.play;
    this.setState({play: play});
    if (play) {
      window.clearInterval(this._timer);
    } else {
      this._timer = window.setInterval(this._play.bind(this), this.props.interval);
    }
  }
  _setStyleFunctions() {
    this._forEachLayer(this.props.map.getLayerGroup(), this._setStyleFunc);
  }
  _setStyleFunc(lyr) {
    if (lyr.get('timeInfo')) {
      var dateInput = React.findDOMNode(this.refs.dateInput);
      var style = lyr.getStyle();
      var timeInfo = lyr.get('timeInfo');
      lyr.setStyle(function(feature, resolution) {
        var start = (timeInfo.start === parseInt(timeInfo.start, 10)) ? timeInfo.start : Date.parse(feature.get(timeInfo.start));
        if (isNaN(start) || start > dateInput.valueAsNumber) {
          return undefined;
        }
        var end = (timeInfo.end === parseInt(timeInfo.end, 10)) ? timeInfo.end : Date.parse(feature.get(timeInfo.end));
        if (isNaN(end) || end < dateInput.valueAsNumber) {
          return undefined;
        }
        if (style instanceof ol.style.Style) {
          return [style];
        } else if (Array.isArray(style)) {
          return style;
        } else {
          return style.call(this, feature, resolution);
        }
      });
    }
  }
  _handleTimeLayer(lyr) {
    if (lyr.get('timeInfo')) {
      lyr.getSource().changed();
    }
  }
  _forEachLayer(lyr, func) {
    if (lyr instanceof ol.layer.Group) {
      lyr.getLayers().forEach(function(child) {
        this._forEachLayer(child, func);
      }, this);
    } else {
      func.call(this, lyr);
    }
  }
  _refreshTimeLayers() {
    this._forEachLayer(this.props.map.getLayerGroup(), this._handleTimeLayer);
  }
  _onRangeChange(evt) {
    React.findDOMNode(this.refs.dateInput).valueAsNumber = evt.target.valueAsNumber;
    this._refreshTimeLayers();
  }
  _onDateChange(evt) {
    React.findDOMNode(this.refs.rangeInput).valueAsNumber = evt.target.valueAsNumber;
    this._refreshTimeLayers();
  }
  _dateToString(ms) {
    var date = new Date(ms);
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
  }
  render() {
    var minDate = this._dateToString(this.props.minDate);
    var buttonIcon;
    if (this.state.play === true) {
      buttonIcon = (<Icon.Icon name='play' />);
    } else {
      buttonIcon = (<Icon.Icon name='pause' />);
    }
    return (
      <form role="form" onSubmit={this._onSubmit} className='form-horizontal playback'>
        <div className="form-group">
          <Grids.Col md={2}><Button.DefaultButton onClick={this._playPause.bind(this)}>{buttonIcon}</Button.DefaultButton></Grids.Col>
          <Grids.Col md={15}><input onChange={this._onRangeChange.bind(this)} ref='rangeInput' type='range' min={this.props.minDate} max={this.props.maxDate} defaultValue={this.props.minDate}/></Grids.Col>
          <Grids.Col md={5}><input onChange={this._onDateChange.bind(this)} ref='dateInput' type='date' defaultValue={minDate} min={this.props.minDate} max={this.props.maxDate}/></Grids.Col>
        </div>
      </form>
    );
  }
}

Playback.propTypes = {
  /**
   * The map whose time-enabled layers should be filtered. Time-enabled layers are layers that have a timeInfo property.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The minimum date to use for the slider field and the date picker.
   */
  minDate: React.PropTypes.number.isRequired,
  /**
   * The maximum date to use for the slider field and the date picker.
   */
  maxDate: React.PropTypes.number.isRequired,
  /**
   * The time, in milliseconds, to wait in each position of the slider. Positions are defined by dividing the slider range by the number of intervals defined in the numIntervals parameter.
   */
  interval: React.PropTypes.number,
  /**
   * The number of intervals into which the full range of the slider is divided.
   */
  numIntervals: React.PropTypes.number,
  /**
   * Should the playback tool start playing automatically?
   */
  autoPlay: React.PropTypes.bool
};

Playback.defaultProps = {
  interval: 500,
  numIntervals: 100,
  autoPlay: false
};
