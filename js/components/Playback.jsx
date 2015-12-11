import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import Button from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Grids from 'pui-react-grids';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './Playback.css';

const messages = defineMessages({
  rangeinputlabel: {
    id: 'playback.rangeinputlabel',
    description: 'Label for the date range input, only used for screen readers',
    defaultMessage: 'Slider control for changing the date'
  },
  dateinputlabel: {
    id: 'playback.dateinputlabel',
    description: 'Label for the date picker input, only used for screen readers',
    defaultMessage: 'Date picker'
  }
});

/**
 * Adds a slider to the map that can be used to select a given date, and modifies the visibility of layers and features depending on their timestamp and the current time.
 */
@pureRender
class Playback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      play: true,
      date: this.props.minDate
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
    var newTime = this.state.date + this._interval;
    if (newTime > this.props.maxDate) {
      newTime = this.props.minDate;
    }
    this.setState({date: newTime});
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
      var style = lyr.getStyle();
      var timeInfo = lyr.get('timeInfo');
      var me = this;
      lyr.setStyle(function(feature, resolution) {
        var start = (timeInfo.start === parseInt(timeInfo.start, 10)) ? timeInfo.start : Date.parse(feature.get(timeInfo.start));
        if (isNaN(start) || start > me.state.date) {
          return undefined;
        }
        var end = (timeInfo.end === parseInt(timeInfo.end, 10)) ? timeInfo.end : Date.parse(feature.get(timeInfo.end));
        if (isNaN(end) || end < me.state.date) {
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
    this.setState({date: evt.target.valueAsNumber});
  }
  _onDateChange(evt) {
    var date = Date.parse(evt.target.value);
    if (!isNaN(date)) {
      this.setState({date: date});
    }
  }
  _dateToString(ms) {
    var date = new Date(ms);
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd  = date.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
  }
  render() {
    this._refreshTimeLayers();
    const {formatMessage} = this.props.intl;
    var dateString = this._dateToString(this.state.date);
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
          <Grids.Col md={15}><label className='sr-only' htmlFor='rangeInput'>{formatMessage(messages.rangeinputlabel)}</label><input id='rangeInput' onChange={this._onRangeChange.bind(this)} ref='rangeInput' type='range' min={this.props.minDate} max={this.props.maxDate} value={this.state.date}/></Grids.Col>
          <Grids.Col md={5}><label htmlFor='dateInput' className='sr-only'>{formatMessage(messages.dateinputlabel)}</label><input id='dateInput' onChange={this._onDateChange.bind(this)} ref='dateInput' type='date' value={dateString} min={this.props.minDate} max={this.props.maxDate}/></Grids.Col>
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
  autoPlay: React.PropTypes.bool,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Playback.defaultProps = {
  interval: 500,
  numIntervals: 100,
  autoPlay: false
};

export default injectIntl(Playback);
