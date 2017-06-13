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
import {zoomIn} from '../../src/actions/MapActions';
import {zoomOut} from '../../src/actions/MapActions';
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

  it('zooms in', function(done) {
    var container = document.createElement('div');
    const store = configureStore();
    ReactDOM.render((
      <BoundlessSdk store={store}>
        <Zoom intl={intl} map={map}/>
      </BoundlessSdk>
    ), container);
    store.dispatch(setView([0,0], 1));
    store.dispatch(zoomIn(1));
    let view = store.getState().mapState.view;
    assert.equal(view.zoom, 2);
    store.dispatch(zoomOut(2));
    view = store.getState().mapState.view;
    assert.equal(view.zoom, 0);
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
