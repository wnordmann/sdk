/* global afterEach, beforeEach, describe, it */

var React = require('react/addons');
var assert = require('chai').assert;
var ol = require('openlayers');
global.Intl = require('intl');
var IntlProvider = require('react-intl').IntlProvider;

var Select = require('../../js/components/Select.jsx');

describe('SelectTool', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function() {
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
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('adds a select interaction to the map', function() {
    var container = document.createElement('div');
    React.render((
      <IntlProvider locale='en'>{() => (<Select map={map} />)}</IntlProvider>
    ), container);

    var count = 0;
    map.getInteractions().forEach(function(interaction) {
      if (interaction instanceof ol.interaction.Select) {
        ++count;
      }
    });
    assert.equal(count, 1);

    React.unmountComponentAtNode(container);
  });

});
