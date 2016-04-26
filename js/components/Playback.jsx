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

import React from 'react';
import ol from 'openlayers';
import IconButton from 'material-ui/lib/icon-button';
import PlayIcon from 'material-ui/lib/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/lib/svg-icons/av/pause';
import Slider from 'material-ui/lib/slider';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import {injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

/**
 * Adds a slider to the map that can be used to select a given date, and modifies the visibility of layers and features depending on their timestamp and the current time.
 *
 * ```javascript
 * class PlaybackApp extends App {
 *   render() {
 *     return (
 *       <div id='content'>
 *         <div ref='map' id='map'>
 *           <div id='timeline'><Playback map={map} minDate={324511200000} maxDate={1385938800000} /></div>
 *         </div>
 *       </div>
 *     );
 *   }
 * }
 * ```
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
          return null;
        }
        var end = (timeInfo.end === parseInt(timeInfo.end, 10)) ? timeInfo.end : Date.parse(feature.get(timeInfo.end));
        if (isNaN(end) || end < me.state.date) {
          return null;
        }
        if (style instanceof ol.style.Style || Array.isArray(style)) {
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
  _onRangeChange(evt, value) {
    this.setState({date: value});
  }
  _onDateChange(evt, value) {
    this.setState({date: value.getTime()});
  }
  render() {
    this._refreshTimeLayers();
    var buttonIcon;
    if (this.state.play === true) {
      buttonIcon = <PlayIcon />;
    } else {
      buttonIcon = <PauseIcon />;
    }
    var minDate = new Date(this.props.minDate);
    var maxDate = new Date(this.props.maxDate);
    return (
      <div>
        <IconButton style={{'float': 'left'}} onTouchTap={this._playPause.bind(this)}>{buttonIcon}</IconButton>
        <Slider style={{'float': 'left', width: '200px', overflow: 'hidden'}} min={this.props.minDate} max={this.props.maxDate} value={this.state.date} onChange={this._onRangeChange.bind(this)} />
        <DatePicker autoOk={true} minDate={minDate} maxDate={maxDate} style={{width: '200px', overflow: 'hidden'}} onChange={this._onDateChange.bind(this)} value={new Date(this.state.date)} />
      </div>
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
