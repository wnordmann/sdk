/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import StyleModal from '../../src/components/StyleModal';
import TestUtils from 'react-addons-test-utils';
import OpenLayersService from '../../src/services/OpenLayersService';

raf.polyfill();

describe('StyleModal', function() {
  var target, map, layers;
  var width = 360;
  var height = 180;
  var styleState = {
    name: 'Test Rule',
    expression: null,
    symbolizers: [{
      labelAttribute: 'NAME10',
      fontColor: {
        hex: '000000',
        rgb: {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        }
      },
      fontSize: '12'
    }, {
      fillColor: {
        hex: '1f3dc5',
        rgb: {
          a: 0.5,
          r: 31,
          g: 61,
          b: 197
        }
      },
      strokeColor: {
        hex: 'bb2828',
        rgb: {
          b: 40,
          g: 40,
          r: 187
        }
      }
    }]
  };

  beforeEach(function(done) {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    layers = [
      new ol.layer.Vector({
        source: new ol.source.Vector()
      }),
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'http://foo'})
      })
    ];
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      layers: layers,
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


  it('sets the geometry type based on the layer', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    layers[0].set('wfsInfo', {
      attributes: ['foo', 'bar'],
      geometryType: 'MultiPolygon'
    });
    assert.equal(dialog.state.geometryType, 'Polygon');
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('renders the style dialog', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<StyleModal intl={intl} layer={layers[0]}/>);
    const actual = renderer.getRenderOutput().props.children[0].props.className;
    const expected = 'style-modal';
    assert.equal(actual, expected);
  });

  it('sets default component properties', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog._styleCache;
    var expected = {};
    assert.deepEqual(actual, expected);
    actual = dialog._ruleCounter;
    expected = 0;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('sets initial state', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog.state;
    var expected = {
      newRuleOpen: false,
      error: false,
      errorOpen: false,
      attributes: [],
      rule: 'Rule 1',
      geometryType: null,
      rules: [{
        name: 'Rule 1'
      }]
    };
    assert.deepEqual(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('sets attributes and geometry type', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    layers[0].set('wfsInfo', {
      attributes: ['foo', 'bar'],
      geometryType: 'MultiPolygon'
    });
    dialog._setGeomTypeAndAttributes();
    var actual = dialog.state.attributes;
    var expected = ['foo', 'bar'];
    assert.deepEqual(actual, expected);
    actual = dialog.state.geometryType;
    expected = 'Polygon';
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('closes new rule dialog', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    dialog.setState({newRuleOpen: true});
    var actual = dialog.state.newRuleOpen;
    var expected = true;
    assert.equal(actual, expected);
    dialog.closeNew();
    actual = dialog.state.newRuleOpen;
    expected = false;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('opens a new rule dialog', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog.state.newRuleOpen;
    var expected = false;
    assert.equal(actual, expected);
    dialog._addRule();
    actual = dialog.state.newRuleOpen;
    expected = true;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('adds a new rule', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    dialog.setState({rules: [], newRuleOpen: true});
    dialog._addNewRule('foo');
    var actual = dialog.state.rules;
    var expected = [{name: 'foo', symbolizers: [{}]}];
    assert.deepEqual(actual, expected);
    actual = dialog.state.rule;
    expected = 'foo';
    assert.equal(actual, expected);
    actual = dialog.state.newRuleOpen;
    expected = false;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('gets rule by name', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog._getRuleByName('Rule 1');
    var expected = dialog.state.rules[0];
    assert.deepEqual(actual, expected);
    dialog.state.rules.push({name: 'Rule 2'});
    actual = dialog._getRuleByName('Rule 2');
    expected = dialog.state.rules[1];
    assert.deepEqual(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('handles error request close', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    dialog.setState({errorOpen: true});
    dialog._handleRequestClose();
    var actual = dialog.state.errorOpen;
    var expected = false;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('removes rule', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    dialog.state.rules.push({name: 'Rule 2'});
    var actual = dialog.state.rules.length;
    var expected = 2;
    assert.equal(actual, expected);
    dialog._removeRule('Rule 1');
    actual = dialog.state.rules.length;
    expected = 1;
    assert.equal(actual, expected);
    actual = dialog.state.rule;
    expected = 'Rule 2';
    assert.equal(actual, expected);
    dialog._removeRule('Rule 2');
    actual = dialog.state.rules.length;
    expected = 0;
    assert.equal(actual, expected);
    actual = dialog.state.rule;
    expected = null;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('creates style using openlayers service', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    dialog.setState({geometryType: 'Polygon'});
    var actual = dialog._createStyle(styleState);
    var expected = OpenLayersService.createStyle(styleState, dialog.state.geometryType);
    assert.deepEqual(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('error is initially undefined', function() {
    const renderer = TestUtils.createRenderer();
    renderer.render(<StyleModal intl={intl} layer={layers[0]}/>);
    const actual = renderer.getRenderOutput().props.children[0].props.children[1];
    const expected = undefined;
    assert.equal(actual, expected);
  });

  it('returns undefined style without style rules', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog._setStyleVector();
    var expected = undefined;
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('sets rules on vector layers', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog.state.rule;
    var expected = 'Rule 1';
    assert.equal(actual, expected);
    layers[0].set('styleInfo', {featureTypeStyles: [{rules: [styleState]}]});
    dialog._setRules();
    actual = dialog.state.rule;
    expected = 'Test Rule';
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('assigns a rule untitled if not named', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[0]}/>
    ), container);
    var actual = dialog.state.rule;
    var expected = 'Rule 1';
    assert.equal(actual, expected);
    layers[0].set('styleInfo', {featureTypeStyles: [{rules: [{symbolizers: [{}]}]}]});
    dialog._setRules();
    actual = dialog.state.rule;
    expected = 'Untitled 1';
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('sets rules on non vector layers', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[1]}/>
    ), container);
    var actual = dialog.state.rule;
    var expected = 'Rule 1';
    assert.equal(actual, expected);
    layers[1].set('styleInfo', {featureTypeStyles: [{rules: [{symbolizers: [{}]}]}]});
    dialog._setRules();
    actual = dialog.state.rule;
    expected = 'Untitled 1';
    assert.equal(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

  it('generates SLD and updates source params', function(done) {
    var container = document.createElement('div');
    var dialog = ReactDOM.render((
      <StyleModal intl={intl} layer={layers[1]}/>
    ), container);
    var actual = dialog.props.layer.getSource().getParams().SLD_BODY;
    var expected = undefined;
    assert.deepEqual(actual, expected);
    actual = dialog.props.layer.getSource().getParams().TILED;
    assert.deepEqual(actual, expected);
    layers[1].set('styleInfo', {featureTypeStyles: [{rules: [styleState]}]});
    dialog.setState({geometryType: 'Polygon'});
    dialog._generateSLD();
    actual = dialog.props.layer.getSource().getParams().SLD_BODY;
    assert.notEqual(actual, expected);
    actual = dialog.props.layer.getSource().getParams().TILED;
    assert.notEqual(actual, expected);
    window.setTimeout(function() {
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 500);
  });

});
