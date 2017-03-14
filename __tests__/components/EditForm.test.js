/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import intl from '../mock-i18n';
import raf from 'raf';
import ol from 'openlayers';
import 'phantomjs-polyfill-object-assign';
import EditForm from '../../src/components/EditForm';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

raf.polyfill();

describe('EditForm', function() {

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

  it('generates the correct inputs', function() {
    var container = document.createElement('div');
    var feature = new ol.Feature({foo: 'bar'});
    var layer = new ol.layer.Vector({
      wfsInfo: {
        attributes: ['foo']
      },
      source: new ol.source.Vector({})
    });
    ReactDOM.render((
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <EditForm map={map} intl={intl} feature={feature} layer={layer} />
      </MuiThemeProvider>
    ), container);
    var inputs = container.querySelectorAll('input');
    assert.equal(inputs[0].id, 'foo');
    assert.equal(inputs[0].value, 'bar');
    ReactDOM.unmountComponentAtNode(container);
  });

});
