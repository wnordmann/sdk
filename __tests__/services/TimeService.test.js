/* global beforeEach, describe, it */

var assert = require('chai').assert;

var TimeService = require('../../js/services/TimeService.js');

describe('TimeService', function() {

  it('parses range correctly', function() {
    var info = TimeService.parse('1995-01-01/2016-12-31/PT5M');
    assert.equal(info.duration, 300000);
    assert.equal(info.start, 788918400000);
    assert.equal(info.end, 1483142400000);
  });

  it('parses discrete date / times correctly', function() {
    var info = TimeService.parse('2013-07-14T05:25:59.000Z,2013-07-14T07:04:32.000Z,2013-07-14T08:10:32.000Z');
    assert.equal(info.length, 3);
    assert.equal(info[0], 1373779559000);
    assert.equal(info[1], 1373785472000);
    assert.equal(info[2], 1373789432000);
  });

});
