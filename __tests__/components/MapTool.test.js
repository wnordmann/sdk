/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var MapTool = require('../../js/components/MapTool.js');

class MyTool extends MapTool {
  render() {
    return (<article />);
  }
}

describe('MapTool', function() {
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
    assert.equal(draw.getMap() !== undefined, true);
    ReactDOM.unmountComponentAtNode(container);
  });

});
