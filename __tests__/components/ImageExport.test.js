/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import TestUtils from 'react-addons-test-utils';
import ImageExport from '../../js/components/ImageExport';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

raf.polyfill();

describe('ImageExport', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    global.MouseEvent = global.Event;
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
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    delete global.MouseEvent;
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('calls render sync on the map when pressed', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <ImageExport intl={intl} map={map}/>
      </MuiThemeProvider>
    ), container);
    var button = container.querySelector('button');
    var called = false;
    map.once('postcompose', function(evt) {
      called = true;
    });
    TestUtils.Simulate.touchTap(button);
    assert.equal(called, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
