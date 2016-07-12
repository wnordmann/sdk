/* global afterEach, beforeEach, describe, it */

var React = require('react');
var ReactDOM = require('react-dom');
var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');
var intl = require('../mock-i18n.js');

var Measure = require('../../js/components/Measure.jsx');

describe('Measure', function() {
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


  it('generates the menu', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    var menus = container.querySelectorAll('[type=button]');
    assert.equal(menus.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('creates internal vector layer', function() {
    var container = document.createElement('div');
    var measure = ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    assert.equal(measure._layer instanceof ol.layer.Vector, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('activates correct interaction', function() {
    var container = document.createElement('div');
    var measure = ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    measure._measureArea();
    assert.equal(measure.currentInteractions.length, 1);
    assert.equal(measure.currentInteractions[0] instanceof ol.interaction.Draw, true);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles drawstart event', function() {
    var container = document.createElement('div');
    var measure = ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    measure._interactions.AREA.dispatchEvent({type: 'drawstart', feature: new ol.Feature({foo: 'bar'})});
    assert.equal(measure._sketch.get('foo'), 'bar');
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles drawend event', function() {
    var container = document.createElement('div');
    var measure = ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    measure._measureArea();
    measure._interactions.AREA.dispatchEvent({type: 'drawstart', feature: new ol.Feature({foo: 'bar'})});
    measure._interactions.AREA.dispatchEvent({type: 'drawend'});
    assert.equal(measure._sketch, null);
    assert.equal(measure._tooltips.length, 1);
    assert.equal(measure._tooltipElement, null);
    ReactDOM.unmountComponentAtNode(container);
  });

  it('handles clear', function() {
    var container = document.createElement('div');
    var measure = ReactDOM.render((
      <Measure intl={intl} map={map} />
    ), container);
    measure._measureArea();
    measure._interactions.AREA.dispatchEvent({type: 'drawstart', feature: new ol.Feature({foo: 'bar'})});
    measure._interactions.AREA.dispatchEvent({type: 'drawend'});
    measure._clear();
    assert.equal(measure._tooltips.length, 0);
    assert.equal(measure._layer.getSource().getFeatures().length, 0);
    for (var key in measure._interactions) {
      assert.equal(measure._interactions[key].getMap(), undefined);
    }
    ReactDOM.unmountComponentAtNode(container);
  });

});
