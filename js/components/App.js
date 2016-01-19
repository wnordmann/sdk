import React from 'react';
import ReactDOM from 'react-dom';

export default class App extends React.Component {
  componentDidMount() {
    if (this.refs.map) {
      var map = this.props.map;
      map.setTarget(ReactDOM.findDOMNode(this.refs.map));
      if (this.props.useHistory) {
        this._initViewFromHash();
        this._shouldUpdate = true;
        map.on('moveend', this._updatePermalink, this);
        // restore the view state when navigating through the history, see
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
        var me = this;
        global.addEventListener('popstate', function(event) {
          if (event.state === null) {
            return;
          }
          var view = me.props.map.getView();
          view.setCenter(event.state.center);
          view.setResolution(event.state.resolution);
          view.setRotation(event.state.rotation);
          me._shouldUpdate = false;
        });
      }
    }
  }
  _updatePermalink() {
    if (!this._shouldUpdate) {
      // do not update the URL when the view was changed in the 'popstate' handler
      this._shouldUpdate = true;
      return;
    }
    var view = this.props.map.getView();
    var center = view.getCenter();
    var hash = '#map=' +
      view.getResolution() + '/' +
      Math.round(center[0] * 100) / 100 + '/' +
      Math.round(center[1] * 100) / 100 + '/' +
      view.getRotation();
    var state = {
      resolution: view.getResolution(),
      center: view.getCenter(),
      rotation: view.getRotation()
    };
    global.history.pushState(state, 'map', hash);
  }
  _initViewFromHash() {
    var view = this.props.map.getView();
    if (global.location.hash !== '') {
      var hash = global.location.hash.replace('#map=', '');
      var parts = hash.split('/');
      if (parts.length === 4) {
        var resolution = parseFloat(parts[0]);
        var center = [
          parseFloat(parts[1]),
          parseFloat(parts[2])
        ];
        var rotation = parseFloat(parts[3]);
        view.setResolution(resolution);
        view.setCenter(center);
        view.setRotation(rotation);
      }
    } else if (this.props.extent) {
      view.fit(this.props.extent, this.props.map.getSize());
    }
  }
}

App.propTypes = {
  /**
   * The map to use for this application.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Extent to fit on the map on loading of the application.
   */
  extent: React.PropTypes.arrayOf(React.PropTypes.number),
  /**
   * Use the back and forward buttons of the browser for navigation history.
   */
  useHistory: React.PropTypes.bool
};

App.defaultProps = {
  useHistory: true
};
