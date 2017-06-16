/* global afterEach, beforeEach, describe, it */

import TestUtils from 'react-addons-test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import 'phantomjs-polyfill-object-assign';
import Zoom from '../../src/components/ZoomView';
import configureStore from '../../src/stores/Store';
import {setView} from '../../src/actions/MapActions';
import BoundlessSdk from '../../src/components/BoundlessSdk';

raf.polyfill();

describe('Zoom', function() {
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
        center: [0, 0],
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

  it('zooms in and out', function(done) {
    var container = document.createElement('div');
    const store = configureStore();
    ReactDOM.render((
      <BoundlessSdk store={store}>
        <Zoom intl={intl} map={map}/>
      </BoundlessSdk>
    ), container);
    let initResolution = map.getView().getResolution();
    store.dispatch(setView({center:[0,0], resolution: initResolution}));
    store.dispatch(setView({resolution: initResolution / 2}));
    let newResolution = store.getState().mapState.view.resolution;
    assert.equal(newResolution, initResolution / 2);
    store.dispatch(setView({resolution: newResolution * 2}));
    assert.equal(store.getState().mapState.view.resolution, initResolution);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 1000);
  });

  it('renders the zoom buttons', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Zoom intl={intl} map={map}/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'sdk-component zoom';
    assert.equal(actual, expected);
  });

});
