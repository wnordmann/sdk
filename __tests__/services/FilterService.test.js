/* global beforeEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import FilterService from '../../src/services/FilterService';

raf.polyfill();

describe('FilterService', function() {

  var features;

  beforeEach(function() {
    features = [
      new ol.Feature({foo: 'bar', no: 1}),
      new ol.Feature({foo: 'baz', no: 2}),
      new ol.Feature({foo: 'bar', no: 3}),
      new ol.Feature({foo: 'foo', no: 4})
    ];
  });


  it('filters correctly using equal operator', function() {
    var queryFilter = FilterService.filter('foo == "bar"');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 2);
    assert.equal(rows[0].get('foo'), 'bar');
    assert.equal(rows[1].get('foo'), 'bar');
  });

  it('filters correctly using not equal operator', function() {
    var queryFilter = FilterService.filter('foo != "bar"');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 2);
    assert.equal(rows[0].get('foo'), 'baz');
    assert.equal(rows[1].get('foo'), 'foo');
  });

  it('filters correctly using less than operator', function() {
    var queryFilter = FilterService.filter('no < 3');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 2);
    assert.equal(rows[0].get('no'), 1);
    assert.equal(rows[1].get('no'), 2);
  });

  it('filters correctly using less than or equal operator', function() {
    var queryFilter = FilterService.filter('no <= 3');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 3);
    assert.equal(rows[0].get('no'), 1);
    assert.equal(rows[1].get('no'), 2);
    assert.equal(rows[2].get('no'), 3);
  });

  it('filters correctly using greater than operator', function() {
    var queryFilter = FilterService.filter('no > 3');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 1);
    assert.equal(rows[0].get('no'), 4);
  });

  it('filters correctly using greater than or equal to operator', function() {
    var queryFilter = FilterService.filter('no >= 3');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 2);
    assert.equal(rows[0].get('no'), 3);
    assert.equal(rows[1].get('no'), 4);
  });

  it('filters correctly using like operator', function() {
    var queryFilter = FilterService.filter('foo like "ba"');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 3);
    assert.equal(rows[0].get('foo'), 'bar');
    assert.equal(rows[1].get('foo'), 'baz');
    assert.equal(rows[2].get('foo'), 'bar');
  });

  it('filters correctly using in operator', function() {
    var queryFilter = FilterService.filter('foo in ("bar", "baz")');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 3);
    assert.equal(rows[0].get('foo'), 'bar');
    assert.equal(rows[1].get('foo'), 'baz');
    assert.equal(rows[2].get('foo'), 'bar');
  });

  it('filters correctly using and operator', function() {
    var queryFilter = FilterService.filter('foo in ("bar", "baz") and foo == "foo"');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 0);
  });

  it('filters correctly using or operator', function() {
    var queryFilter = FilterService.filter('foo in ("bar", "baz") or foo == "foo"');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 4);
  });

  it('filters correctly using not operator', function() {
    var queryFilter = FilterService.filter('foo not in ("bar", "baz")');
    var rows = [];
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (queryFilter(properties)) {
        rows.push(features[i]);
      }
    }
    assert.equal(rows.length, 1);
  });

  it('filterToExpression works correctly (all)', function() {
    var filter = ['all', ['<=', 'foo', 20], ['>=', 'foo', 10]];
    var expr = FilterService.filterToExpression(filter);
    assert.equal(expr, 'foo <= 20 and foo >= 10');
  });

  it('filterToExpression works correctly (any)', function() {
    var filter = ['any', ['<=', 'foo', 20], ['>=', 'foo', 10]];
    var expr = FilterService.filterToExpression(filter);
    assert.equal(expr, 'foo <= 20 or foo >= 10');
  });

  it('filterToExpression works correctly', function() {
    var filter = ['<=', 'foo', 20];
    var expr = FilterService.filterToExpression(filter);
    assert.equal(expr, 'foo <= 20');
  });

});
