/* global ol */
import React from 'react';
import Slider from 'react-slick';
import './Bookmarks.css';

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
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  bookmarks: React.PropTypes.array.isRequired,
  showIndicators: React.PropTypes.bool,
  animatePanZoom: React.PropTypes.bool,
  animationDuration: React.PropTypes.number,
  introTitle: React.PropTypes.string,
  introDescription: React.PropTypes.string
};

Bookmarks.defaultProps = {
  showIndicators: true,
  animatePanZoom: true,
  introTitle: '',
  introDescription: '',
  animationDuration: 500
};
