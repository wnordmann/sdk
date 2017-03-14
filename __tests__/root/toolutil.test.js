/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import AppDispatcher from '../../src/dispatchers/AppDispatcher';
import ToolUtil from '../../src/toolutil';

raf.polyfill();

class MyTool extends React.Component {
  constructor(props) {
    super(props);
    this._dispatchToken = ToolUtil.register(this);
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._dispatchToken);
  }
  activate(interactions) {
    ToolUtil.activate(this, interactions);
  }
  deactivate() {
    ToolUtil.deactivate(this);
  }
  render() {
    return (<article />);
  }
}

describe('ToolUtil', function() {
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


  it('adds the interaction to the map upon activate', function() {
    var container = document.createElement('div');
    var tool = ReactDOM.render((
      <MyTool intl={intl} map={map}/>
    ), container);
    var draw = new ol.interaction.Draw({});
    assert.equal(draw.getMap(), undefined);
    tool.activate(draw);
    assert.equal(draw.getMap() !== null, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles toggleGroup correctly', function() {
    var container1 = document.createElement('div');
    var container2 = document.createElement('div');
    var tool1 = ReactDOM.render((
      <MyTool toggleGroup='foo' intl={intl} map={map}/>
    ), container1);
    var tool2 = ReactDOM.render((
      <MyTool toggleGroup='foo' intl={intl} map={map}/>
    ), container2);
    var draw1 = new ol.interaction.Draw({});
    var draw2 = new ol.interaction.Draw({});
    tool1.activate(draw1);
    assert.equal(draw1.getMap() !== null, true);
    assert.equal(draw2.getMap() !== null, false);
    tool2.activate(draw2);
    assert.equal(draw1.getMap() !== null, false);
    assert.equal(draw2.getMap() !== null, true);
    ReactDOM.unmountComponentAtNode(container1);
    ReactDOM.unmountComponentAtNode(container2);
  });

  it('handles toolId correctly', function() {
    var container1 = document.createElement('div');
    var container2 = document.createElement('div');
    var tool1 = ReactDOM.render((
      <MyTool toolId='tool1' toggleGroup='foo' intl={intl} map={map}/>
    ), container1);
    var draw1 = new ol.interaction.Draw({});
    var draw2 = new ol.interaction.Draw({});
    tool1.activate(draw1);
    var tool2 = ReactDOM.render((
      <MyTool toolId='tool1' toggleGroup='foo' intl={intl} map={map}/>
    ), container2);
    tool2.activate(draw2);
    assert.equal(draw1.getMap() !== null, true);
    ReactDOM.unmountComponentAtNode(container1);
    ReactDOM.unmountComponentAtNode(container2);
  });

});
