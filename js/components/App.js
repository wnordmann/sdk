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
import ReactDOM from 'react-dom';
import ol from 'openlayers';

/**
 * Base class for applications. Can handle using the browser history to navigate through map extents.
 * An initial extent can be provided as well.
 *
 * ```javascript
 *
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import ol from 'openlayers';
 * import {IntlProvider} from 'react-intl';
 * import App from './node_modules/boundless-sdk/js/components/App.js';
 * import enMessages from './node_modules/boundless-sdk/locale/en.js';
 *
 * class MyApp extends App {
 *   componentDidMount() {
 *     super.componentDidMount();
 *     // your code here
 *   }
 *   render() {
 *     // we need to provide a reference to the map
 *     return (
 *       <div id='map' ref='map'></div>
 *     );
 *   }
 * }
 *
 * var extent = [1327331, 4525032, 5123499, 5503426];
 * ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><MyApp extent={extent} useHistory={false} map={map} /></IntlProvider>, document.getElementById('main'));
 * ```
 */
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
