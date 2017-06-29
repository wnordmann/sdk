/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import ol from 'openlayers';
import intl from '../mock-i18n';
import Geolocation from '../../src/components/Geolocation';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import BoundlessSdk from '../../src/components/BoundlessSdk';
import configureStore from '../../src/stores/Store';
import '../polyfills';

describe('Geolocation', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      view: new ol.View({
        center: [0,0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });

  it('renders the Geolocation component', function() {
    var container = document.createElement('div');
    const store = configureStore();
    ReactDOM.render((
      <div>
        <BoundlessSdk store={store}>
          <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Geolocation intl={intl} map={map}/>
          </MuiThemeProvider>
        </BoundlessSdk>
      </div>
    ), container);
    const actual = container.children[0].innerHTML;
    const expected = 'sdk-component geolocation';
    assert.include(actual, expected);
    ReactDOM.unmountComponentAtNode(container);
  });

});
