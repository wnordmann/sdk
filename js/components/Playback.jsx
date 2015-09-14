/* global ol */
import React from 'react';
import Button from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Grids from 'pui-react-grids';
import './Playback.css';

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
        var start = Date.parse(feature.get(timeInfo.start));
        if (isNaN(start) || start > dateInput.valueAsNumber) {
          return null;
        }
        var end = Date.parse(feature.get(timeInfo.end));
        if (isNaN(end) || end < dateInput.valueAsNumber) {
          return null;
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
      <form role="form" onSubmit={this._onSubmit.bind(this)} className='form-horizontal playback'>
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
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  minDate: React.PropTypes.number.isRequired,
  maxDate: React.PropTypes.number.isRequired,
  interval: React.PropTypes.number,
  numIntervals: React.PropTypes.number,
  autoPlayFromStart: React.PropTypes.bool
};

Playback.defaultProps = {
  interval: 500,
  numIntervals: 100,
  autoPlayFromStartup: false
};
