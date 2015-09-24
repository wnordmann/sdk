/* global ol */
import React from 'react';
import Slider from 'react-slick';
import './Bookmarks.css';
import '../../node_modules/slick-carousel-dr-frankenstyle/slick/slick.css';

/**
 * Adds the ability to retrieve spatial bookmarks.
 * A spatial bookmark consists of a name, an extent and a description.
 */
export default class Bookmarks extends React.Component {
  constructor(props) {
    super(props);
    var map = this.props.map, view = map.getView();
    this._center = view.getCenter();
    this._zoom = view.getZoom();
  }
  _afterChange(idx) {
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
    if (idx === 0) {
      view.setCenter(this._center);
      view.setZoom(this._zoom);
    } else {
      var bookmark = this.props.bookmarks[idx - 1];
      var extent = bookmark.extent;
      view.fit(extent, map.getSize());
    }
  }
  render() {
    var getHTML = function(bookmark) {
      return {__html: bookmark.description};
    };
    var carouselChildren = this.props.bookmarks.map(function(bookmark) {
      return (<div key={bookmark.name} className="col-md-12 text-center"><h2>{bookmark.name}</h2><p dangerouslySetInnerHTML={getHTML(bookmark)}></p></div>);
    });
    carouselChildren.unshift(<div key='intro'><h2>{this.props.introTitle}</h2><p>{this.props.introDescription}</p></div>);
    return (
      <div className='story-panel'>
        <Slider dots={this.props.showIndicators} arrows={true} afterChange={this._afterChange.bind(this)}>
          {carouselChildren}
        </Slider>
      </div>
    );
  }
}

Bookmarks.propTypes = {
  /**
   * The ol3 map instance on whose view we should navigate.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The bookmark data. An array of objects with name, description and extent keys.
   * The extent should be in the view projection.
   */
  bookmarks: React.PropTypes.array.isRequired,
  /**
   * Should we show indicators? These are dots to navigate the bookmark pages.
   */
  showIndicators: React.PropTypes.bool,
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
  introDescription: React.PropTypes.string
};

Bookmarks.defaultProps = {
  showIndicators: true,
  animatePanZoom: true,
  introTitle: '',
  introDescription: '',
  animationDuration: 500
};
