/* global describe, it */

import {assert} from 'chai';
import Util from '../../src/util';

describe('util', function() {

  it('proxies a url', function() {
    var url = 'http://myserver/wfs?service=WFS&request=GetCapabilities';
    var proxiedUrl = Util.getProxiedUrl(url, 'http://proxy/?url=');
    assert.equal(proxiedUrl, 'http://proxy/?url=http%3A%2F%2Fmyserver%2Fwfs%3Fservice%3DWFS%26request%3DGetCapabilities');
  });

  it('transforms a color when rgb is present', function() {
    var input = {rgb: {r: 255, g: 0, b: 0, a:1}};
    var color = Util.transformColor(input);
    assert.equal(color[0], input.rgb.r);
    assert.equal(color[1], input.rgb.g);
    assert.equal(color[2], input.rgb.b);
    assert.equal(color[3], input.rgb.a);
  });

  it('transforms a color when rgb is not present', function() {
    var input = {r: 255, g: 0, b: 0, a:1};
    var color = Util.transformColor(input);
    assert.equal(color[0], input.r);
    assert.equal(color[1], input.g);
    assert.equal(color[2], input.b);
    assert.equal(color[3], input.a);
  });

  it('gives back correct time info', function() {
    var dim = Util.getTimeInfo({Dimension: [{name: 'time', values: '1995-01-01/2016-12-31/PT5M'}]});
    assert.equal(dim, '1995-01-01/2016-12-31/PT5M');
    dim = Util.getTimeInfo({Dimension: [{name: 'altitude', values: '2010'}]});
    assert.equal(dim, undefined);
  });

  it('transforms rgb to hex', function() {
    var rgb = 'rgba(255, 0, 0, 0.5)';
    assert.equal(Util.rgbToHex(rgb), '#ff0000');
    rgb = 'rgba(0, 255, 0)';
    assert.equal(Util.rgbToHex(rgb), '#00ff00');
    rgb = 'rgb(0, 0, 255)';
    assert.equal(Util.rgbToHex(rgb), '#0000ff');
  });

  it('transforms hex to rgb', function() {
    var hex = '#FF0000';
    var result = Util.hexToRgb(hex);
    assert.equal(result.r, 255);
    assert.equal(result.g, 0);
    assert.equal(result.b, 0);
    hex = 'foo';
    result = Util.hexToRgb(hex);
    assert.equal(result, null);
  });

  it('performs JSONP and substitutes __cbname__', function() {
    Util.doJSONP('/foo?callback=__cbname__');
    var url;
    for (var i = 0, ii = document.head.childNodes.length; i < ii; i++) {
      if (document.head.childNodes[i].tagName === 'SCRIPT') {
        url = document.head.childNodes[i].src;
        break;
      }
    }
    assert.equal(url.indexOf('__cbname__'), -1);
  });

});
