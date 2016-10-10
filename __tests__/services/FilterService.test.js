/* global beforeEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var FilterService = require('../../js/services/FilterService.js');

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

});
