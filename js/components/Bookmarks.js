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
import Slider from 'react-slick';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import './Bookmarks.css';
import './slick.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  dropdowntext: {
    id: 'bookmarks.dropdowntext',
    description: 'Text to use on the Bookmarks drop down',
    defaultMessage: 'Bookmarks'
  }
});

/**
 * Adds the ability to retrieve spatial bookmarks.
 * A spatial bookmark consists of a name, an extent and a description. Extent needs to be in the view projection.
 *
 * ```xml
 * <Bookmarks introTitle='Paris bakeries' introDescription='Explore the best bakeries of the capital of France' map={map} bookmarks={[{name: 'foo1', description: 'description1', extent: [259562, 6254560, 260675, 6256252]}, {name: 'foo2', description: 'description2', extent: [258703, 6248811, 259816, 6250503]}]} />
 * ```
 */
@pureRender
class Bookmarks extends React.Component {
  static propTypes = {
    /**
     * The ol3 map instance on whose view we should navigate.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the menu or the div.
     */
    className: React.PropTypes.string,
    /**
     * The bookmark data. An array of objects with name (string, required), description (string, required) and extent (array of number, required) keys.
     * The extent should be in the view projection.
     */
    bookmarks: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      extent: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
    })).isRequired,
    /**
     * Should we show indicators? These are dots to navigate the bookmark pages.
     */
    dots: React.PropTypes.bool,
    /**
     * Should the scroller auto scroll?
     */
    autoplay: React.PropTypes.bool,
    /**
     * Delay between each auto scoll in ms.
     */
    autoplaySpeed: React.PropTypes.number,
    /**
     * Should we animate the pan and zoom operation?
     */
    animatePanZoom: React.PropTypes.bool,
    /**
     * The duration of the animation in milleseconds. Only relevant if animatePanZoom is true.
     */
    animationDuration: React.PropTypes.number,
    /**
     * The title on the introduction (first) page of the bookmarks.
     */
    introTitle: React.PropTypes.string,
    /**
     * The description of the introduction (first) page of the bookmarks.
     */
    introDescription: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired,
    /**
     * Display as a menu drop down list.
     */
    menu: React.PropTypes.bool,
    /**
     * Should we display a marker for the bookmark?
     */
    showMarker: React.PropTypes.bool,
    /**
     * Url to the marker image to use for bookmark position.
     */
    markerUrl: React.PropTypes.string
  };

  static defaultProps = {
    style: {
      margin: '10px 12px'
    },
    dots: true,
    autoplay: false,
    animatePanZoom: true,
    introTitle: '',
    introDescription: '',
    animationDuration: 500,
    menu: false,
    showMarker: true,
    markerUrl: './resources/marker.png'
  };

  constructor(props) {
    super(props);
    var view = this.props.map.getView();
    this._center = view.getCenter();
    this._resolution = view.getResolution();
    if (this._center === null) {
      view.once('change:center', function(evt) {
        this._center = evt.target.getCenter();
      }, this);
    }
    if (this._resolution === undefined) {
      view.once('change:resolution', function(evt) {
        this._resolution = evt.target.getResolution();
      }, this);
    }
    this.state = {
      value: null
    }
  }
  componentDidMount() {
    if (this.props.showMarker) {
      this._layer = new ol.layer.Vector({
        title: null,
        managed: false,
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.75,
            src: this.props.markerUrl
          })
        }),
        source: new ol.source.Vector({wrapX: false})
      });
      this.props.map.addLayer(this._layer);
    }
  }
  _handleChange(event, value) {
    this.setState({value: value});
    this._selectBookmark(value);
  }
  _selectBookmark(bookmark) {
    var map = this.props.map, view = map.getView();
    if (this.props.animatePanZoom === true) {
      var pan = ol.animation.pan({
        duration: this.props.animationDuration,
        source: view.getCenter()
      });
      var zoom = ol.animation.zoom({
        duration: this.props.animationDuration,
        resolution: view.getResolution(),
        source: view.getZoom()
      });
      map.beforeRender(pan, zoom);
    }
    var center;
    if (bookmark) {
      var extent = bookmark.extent;
      view.fit(extent, map.getSize());
      center = ol.extent.getCenter(extent);
    } else {
      view.setCenter(this._center);
      view.setResolution(this._resolution);
      center = this._center;
    }
    if (this.props.showMarker) {
      var source = this._layer.getSource();
      source.clear();
      var feature = new ol.Feature({
        geometry: new ol.geom.Point(center)
      });
      source.addFeature(feature);
    }
  }
  _afterChange(idx) {
    var bookmark = idx === 0 ? false : this.props.bookmarks[idx - 1];
    this._selectBookmark(bookmark);
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.props.menu === true) {
      var menuChildren = this.props.bookmarks.map(function(bookmark) {
        return (<MenuItem key={bookmark.name} value={bookmark.name} primaryText={bookmark.name}/>);
      }, this);
      return (
        <IconMenu anchorOrigin={{horizontal: 'left', vertical: 'top'}} targetOrigin={{horizontal: 'left', vertical: 'top'}} className={classNames('sdk-component story-panel', this.props.className)} iconButtonElement={<RaisedButton label={formatMessage(messages.dropdowntext)} />} value={this.state.value} onChange={this._handleChange.bind(this)}>
          {menuChildren}
        </IconMenu>
      );
    } else {
      var getHTML = function(bookmark) {
        return {__html: bookmark.description};
      };
      var carouselChildren = this.props.bookmarks.map(function(bookmark) {
        return (<div key={bookmark.name}><h2>{bookmark.name}</h2><p dangerouslySetInnerHTML={getHTML(bookmark)}></p></div>);
      });
      carouselChildren.unshift(<div key='intro'><h2>{this.props.introTitle}</h2><p>{this.props.introDescription}</p></div>);
      return (
        <div className={classNames('sdk-component story-panel', this.props.className)}>
          <Slider {...this.props} arrows={true} afterChange={this._afterChange.bind(this)}>
            {carouselChildren}
          </Slider>
        </div>
      );
    }
  }
}

export default injectIntl(Bookmarks);
